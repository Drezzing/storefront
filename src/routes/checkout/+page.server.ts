import { fail } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";

import env from "$lib/env/public";
import { handleError } from "$lib/error.js";
import { getPriceDetails, type CheckoutData } from "$lib/medusa/checkout.js";
import { checkCartExists, medusa } from "$lib/medusa/medusa.js";
import { zod4Mini } from "$lib/schemas/adapters.js";
import { shippingFormSchema, userInfoFormSchema, type ShippingFormType } from "$lib/schemas/checkout";

export const prerender = false;

export const load = async ({ cookies }) => {
    const cartId = cookies.get("panier");
    const cartInfo = await checkCartExists(cartId);

    if (cartInfo.err) {
        return {
            cart: false,
            userInfoForm: null,
            shippingForm: null,
            shippingOptions: null,
            priceDetails: null,
        } satisfies CheckoutData;
    }

    const so = await medusa.shippingOptions.listCartOptions(cartInfo.cart.id).catch((err) => {
        return handleError(500, "CHECKOUT_LOAD_ACTION.LIST_CART_OPTIONS_FAILED", { error: err.response.data });
    });

    const shippingOptions = so.shipping_options.map((option) => {
        const optionPrice = (option.price_incl_tax ?? 0) / 100;
        return {
            id: option.id!,
            name: `${option.name} - ${optionPrice ? `${optionPrice.toFixed(2)}€` : "Gratuite"}`,
        };
    });

    return {
        cart: true,
        userInfoForm: await superValidate(zod4Mini(userInfoFormSchema), {
            id: "info",
        }),
        shippingForm: await superValidate(zod4Mini(shippingFormSchema), {
            id: "shipping",
            defaults: {
                method: env.get("PUBLIC_MEDUSA_DEFAULT_SHIPPING_ID"),
                address: undefined,
                complement: undefined,
                city: undefined,
                postal_code: undefined,
                // department: undefined,
                // country: undefined,
            },
        }),
        shippingOptions,
        priceDetails: getPriceDetails(cartInfo.cart),
    } satisfies CheckoutData;
};

export const actions = {
    userInfo: async (event) => {
        const userInfoForm = await superValidate(event, zod4Mini(userInfoFormSchema));
        if (!userInfoForm.valid) {
            return fail(400, {
                userInfoForm,
                success: false,
            });
        }

        const cartId = event.cookies.get("panier");
        const cartInfo = await checkCartExists(cartId);

        if (cartInfo.err) {
            return handleError(404, "CHECKOUT_USERINFO_ACTION.CART_NOT_FOUND", { error: cartInfo.err });
        }

        const cartUpdated = await medusa.carts
            .update(cartInfo.cart.id, { email: userInfoForm.data.mail })
            .catch((err) => {
                return handleError(500, "CHECKOUT_USERINFO_ACTION.UPDATE_CART_FAILED", { error: err.response.data });
            });

        await medusa.admin.customers
            .update(cartUpdated.cart.customer_id, {
                first_name: userInfoForm.data.firstName,
                last_name: userInfoForm.data.lastName,
            })
            .catch((err) => {
                return handleError(500, "CHECKOUT_USERINFO_ACTION.UPDATE_CUSTOMER_FAILED", {
                    error: err.response.data,
                });
            });

        return { userInfoForm, success: true };
    },

    shipping: async (event) => {
        const shippingForm = await superValidate(event, zod4Mini(shippingFormSchema));
        if (!shippingForm.valid) {
            return fail(400, {
                shippingForm,
                success: false,
            });
        }

        const cartId = event.cookies.get("panier");
        const cartInfo = await checkCartExists(cartId);

        if (cartInfo.err) {
            return handleError(500, "CHECKOUT_SHIPPING_ACTION.CART_NOT_FOUND");
        }

        const promises = [
            medusa.carts.addShippingMethod(cartInfo.cart.id, { option_id: shippingForm.data.method }).catch((err) => {
                return handleError(500, "CHECKOUT_SHIPPING_ACTION.UPDATE_SHIPPING_METHOD_FAILED", {
                    error: err.response.data,
                });
            }),
        ];

        if (shippingForm.data.method !== env.get("PUBLIC_MEDUSA_DEFAULT_SHIPPING_ID")) {
            // const country_code = cartInfo.cart.region.countries.find(
            //     (country) => country.name === form.data.country?.toUpperCase(),
            // );

            const shippingAddress = shippingForm.data as Required<ShippingFormType>;
            const shppingUpdate = medusa.carts
                .update(cartInfo.cart.id, {
                    shipping_address: {
                        address_1: shippingAddress.address,
                        address_2: shippingAddress.complement,
                        city: shippingAddress.city,
                        postal_code: shippingAddress.postal_code,
                        country_code: "fr",
                    },
                })
                .catch((err) => {
                    return handleError(500, "CHECKOUT_SHIPPING_ACTION.UPDATE_SHIPPING_ADDRESS_FAILED", {
                        error: err.response.data,
                    });
                });
            promises.push(shppingUpdate);
        }

        const [cartUpdated] = await Promise.all(promises);

        return { shippingForm, success: true, priceDetails: getPriceDetails(cartUpdated.cart) };
    },
};
