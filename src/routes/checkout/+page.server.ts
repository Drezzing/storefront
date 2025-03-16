import { fail } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import { PUBLIC_DEFAULT_SHIPPING_ID } from "$env/static/public";
import { shippingFormSchema, userInfoFormSchema } from "$lib/checkout/formSchema";
import { handleError } from "$lib/error.js";
import { checkCartExists, medusa } from "$lib/medusa/medusa.js";
import { getPriceDetails, type CheckoutData } from "$lib/medusa/checkout.js";

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
        userInfoForm: await superValidate(zod(userInfoFormSchema), {
            id: "info",
            defaults: { firstName: "abc", lastName: "def", mail: "test@test.com" },
        }),
        shippingForm: await superValidate(zod(shippingFormSchema), {
            id: "shipping",
            defaults: {
                method: PUBLIC_DEFAULT_SHIPPING_ID,
                address: undefined,
                complement: undefined,
                city: undefined,
                department: undefined,
                postal_code: undefined,
                // country: undefined,
            },
        }),
        shippingOptions,
        priceDetails: getPriceDetails(cartInfo.cart),
    } satisfies CheckoutData;
};

export const actions = {
    userInfo: async (event) => {
        const form = await superValidate(event, zod(userInfoFormSchema));
        if (!form.valid) {
            return fail(400, {
                form,
                success: false,
            });
        }

        const cartId = event.cookies.get("panier");
        const cartInfo = await checkCartExists(cartId);

        if (cartInfo.err) {
            return handleError(404, "CHECKOUT_USERINFO_ACTION.CART_NOT_FOUND", { error: cartInfo.err });
        }

        const cartUpdated = await medusa.carts.update(cartInfo.cart.id, { email: form.data.mail }).catch((err) => {
            return handleError(500, "CHECKOUT_USERINFO_ACTION.UPDATE_CART_FAILED", { error: err.response.data });
        });

        await medusa.admin.customers
            .update(cartUpdated.cart.customer_id, {
                first_name: form.data.firstName,
                last_name: form.data.lastName,
            })
            .catch((err) => {
                return handleError(500, "CHECKOUT_USERINFO_ACTION.UPDATE_CUSTOMER_FAILED", {
                    error: err.response.data,
                });
            });

        return { form, success: true };
    },

    shipping: async (event) => {
        const form = await superValidate(event, zod(shippingFormSchema));
        if (!form.valid) {
            return fail(400, {
                form,
                success: false,
            });
        }

        const cartId = event.cookies.get("panier");
        const cartInfo = await checkCartExists(cartId);

        if (cartInfo.err) {
            return handleError(500, "test");
        }

        const promises = [
            medusa.carts.addShippingMethod(cartInfo.cart.id, { option_id: form.data.method }).catch((err) => {
                return handleError(500, "CHECKOUT_SHIPPING_ACTION.UPDATE_SHIPPING_METHOD_FAILED", {
                    error: err.response.data,
                });
            }),
        ];

        if (form.data.method !== PUBLIC_DEFAULT_SHIPPING_ID) {
            // const country_code = cartInfo.cart.region.countries.find(
            //     (country) => country.name === form.data.country?.toUpperCase(),
            // );

            const shppingUpdate = medusa.carts
                .update(cartInfo.cart.id, {
                    shipping_address: {
                        address_1: form.data.address,
                        address_2: form.data.complement,
                        city: form.data.city,
                        postal_code: form.data.postal_code,
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

        return { form, success: true, priceDetails: getPriceDetails(cartUpdated.cart) };
    },
};
