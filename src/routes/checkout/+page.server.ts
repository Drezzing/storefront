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

    const so = await medusa.shippingOptions.listCartOptions(cartInfo.cart.id);
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
            defaults: { method: PUBLIC_DEFAULT_SHIPPING_ID },
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
            return handleError(500, "test");
        }

        const cartUpdated = await medusa.carts.update(cartInfo.cart.id, { email: form.data.mail }).catch((err) => {
            return handleError(500, "CHECKOUT_POST.UPDATE_CART_FAILED", { error: err.response.data });
        });

        await medusa.admin.customers.update(cartUpdated.cart.customer_id, {
            first_name: form.data.firstName,
            last_name: form.data.lastName,
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

        const cartUpdated = await medusa.carts.addShippingMethod(cartInfo.cart.id, { option_id: form.data.method });

        return { form, success: true, priceDetails: getPriceDetails(cartUpdated.cart) };
    },
};
