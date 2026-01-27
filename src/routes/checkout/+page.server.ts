import { fail } from "@sveltejs/kit";
import crypto from "crypto";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import env from "$lib/env/private";
import { handleError } from "$lib/error.js";
import { getPriceDetails, type CheckoutData } from "$lib/medusa/checkout.js";
import { checkCartExists, checkShippingOptionExists, medusa } from "$lib/medusa/medusa.js";
import { getShippableProductsForCart, getShippingOptionsForCart } from "$lib/medusa/shipping.js";
import {
    shippingFormSchema,
    shippingManualSchema,
    shippingMondialRelayHomeSchema,
    shippingMondialRelayParcelSchema,
    userInfoFormSchema,
} from "$lib/schemas/checkout";

export const prerender = false;

const aesEncrypt = (text: string) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(env.get("SHIPPING_AES_KEY")), iv);

    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString("hex") + ":" + encrypted.toString("hex");
};

export const load = async ({ cookies }) => {
    const cartId = cookies.get("panier");
    const cartInfo = await checkCartExists(cartId);

    if (cartInfo.err) {
        return {
            cart: false,
            userInfoForm: null,
            shipping: null,
            priceDetails: null,
        } satisfies CheckoutData;
    }

    const shippingOptions = await getShippingOptionsForCart(cartInfo.cart.id);
    const shippableProducts = getShippableProductsForCart(cartInfo.cart.items);

    return {
        cart: true,
        // @ts-expect-error undefined to force select on placeholder
        userInfoForm: await superValidate(zod4(userInfoFormSchema), {
            id: "info",
            defaults: {
                firstName: "",
                lastName: "",
                mail: "",
                profile: undefined,
            },
        }),
        shipping: {
            forms: {
                manualMethodForm: await superValidate(zod4(shippingManualSchema), {
                    id: "shipping-method-manual",
                }),
                parcelShippingMethodForm: await superValidate(zod4(shippingMondialRelayParcelSchema), {
                    id: "shipping-method-mondial-relay-parcel",
                }),
                homeShippingMethodForm: await superValidate(zod4(shippingMondialRelayHomeSchema), {
                    id: "shipping-method-mondial-relay-home",
                }),
            },
            shippingOptions: shippingOptions,
            shippableProducts: shippableProducts,
        },
        priceDetails: getPriceDetails(cartInfo.cart),
    } satisfies CheckoutData;
};

export const actions = {
    userInfo: async (event) => {
        const userInfoForm = await superValidate(event, zod4(userInfoFormSchema));
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
                metadata: {
                    profile: userInfoForm.data.profile,
                },
            })
            .catch((err) => {
                return handleError(500, "CHECKOUT_USERINFO_ACTION.UPDATE_CUSTOMER_FAILED", {
                    error: err.response.data,
                });
            });

        return { userInfoForm, success: true };
    },

    shipping: async (event) => {
        const shippingForm = await superValidate(event, zod4(shippingFormSchema));

        if (!shippingForm.valid) {
            return fail(400, {
                shippingForm,
                success: false,
            });
        }

        const cartId = event.cookies.get("panier");
        const [cartInfo, shippingOptionInfo] = await Promise.all([
            checkCartExists(cartId),
            checkShippingOptionExists(shippingForm.data.method),
        ]);

        if (cartInfo.err) {
            return handleError(404, "CHECKOUT_SHIPPING_ACTION.CART_NOT_FOUND");
        }

        if (shippingOptionInfo.err) {
            return handleError(404, "CHECKOUT_SHIPPING_ACTION.SHIPPING_OPTION_NOT_FOUND");
        }

        // if null and not calculated, means something probably went wrong
        const isReallyNull =
            shippingOptionInfo.shipping_option.amount === null &&
            shippingOptionInfo.shipping_option.price_type != "calculated";

        // if < 0, means this cart only has non-shippable products
        const isNegative = (shippingOptionInfo.shipping_option.amount || 0) < 0;
        if (isReallyNull || isNegative) {
            return handleError(400, "CHECKOUT_SHIPPING_ACTION.SHIPPING_OPTION_NOT_AVAILABLE", {
                id: shippingOptionInfo.shipping_option.id,
                name: shippingOptionInfo.shipping_option.name,
            });
        }

        const promises = [
            medusa.carts.addShippingMethod(cartInfo.cart.id, { option_id: shippingForm.data.method }).catch((err) => {
                return handleError(500, "CHECKOUT_SHIPPING_ACTION.UPDATE_SHIPPING_METHOD_FAILED", {
                    error: err.response.data,
                });
            }),
        ];

        if (shippingForm.data.fulfillment_id != "manual-fulfillment") {
            const shippingUpdate = medusa.carts.update(cartInfo.cart.id, {
                context: {
                    ...cartInfo.cart.context,
                    shipping_data: aesEncrypt(JSON.stringify(shippingForm.data)),
                },
            });
            promises.push(shippingUpdate);
        }
        const [cartUpdated] = await Promise.all(promises);

        return { shippingForm, success: true, priceDetails: getPriceDetails(cartUpdated.cart) };
    },
};
