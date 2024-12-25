import { type PaymentIntent } from "@stripe/stripe-js";
import { json } from "@sveltejs/kit";

import { handleError } from "$lib/error";
import { discountNotUsed, removeDiscounts } from "$lib/medusa/discount";
import { checkCartExists, medusa } from "$lib/medusa/medusa";
import { isVariantSoldout } from "$lib/medusa/product";
import { stripe } from "$lib/payment/stripe.js";

// export const POST = async ({ cookies, request }) => {
//     const cartInfo = await checkCartExists(cookies.get("panier"));
//     if (cartInfo.err) {
//         return handleError(400, "CHECKOUT_POST.CART_INVALID", { cart_id: cookies.get("panier") });
//     }

//     if (cartInfo.cart.items.some((item) => isVariantSoldout(item.variant))) {
//         return handleError(423, "CHECKOUT_POST.CART_ITEM_SOLDOUT");
//     }

//     if (cartInfo.cart.completed_at) {
//         cookies.delete("panier", { path: "/" });
//         return handleError(423, "CHECKOUT_POST.CART_ALREADY_COMPLETED", { cart_id: cartInfo.cart.id });
//     }

//     if (cartInfo.cart.payment_session) {
//         return json({ client_secret: cartInfo.cart.payment_session.data.client_secret as string });
//     }

//     const reqJson = await request.json().catch(async () => {
//         return handleError(400, "CHECKOUT_POST.INVALID_BODY", { body: await request.text() });
//     });

//     const userDataValid = CartUserData.safeParse(reqJson);
//     if (!userDataValid.success) {
//         return handleError(422, "CHECKOUT_POST.INVALID_DATA", { data: reqJson });
//     }

//     if (discountNotUsed(cartInfo.cart)) {
//         await removeDiscounts(cartInfo.cart, "CHECKOUT_POST");
//     }

//     const { cart } = await medusa.carts
//         .update(cartInfo.cart.id, {
//             email: userDataValid.data.mail,
//             billing_address: {
//                 first_name: userDataValid.data.firstName,
//                 last_name: userDataValid.data.lastName,
//             },
//         })
//         .catch((err) => {
//             return handleError(500, "CHECKOUT_POST.UPDATE_CART_FAILED", { error: err.response.data });
//         });

//     await medusa.carts.createPaymentSessions(cart.id).catch((err) => {
//         return handleError(500, "CHECKOUT_POST.CREATE_PAYMENT_FAILED", { error: err.response.data });
//     });

//     const { cart: final } = await medusa.carts
//         .setPaymentSession(cartInfo.cart.id, { provider_id: "stripe" })
//         .catch((err) => {
//             return handleError(500, "CHECKOUT_POST.SET_SESSION_FAILED", { error: err.response.data });
//         });

//     if (!final.payment_session) {
//         return handleError(500, "CHECKOUT_POST.PAYEMENT_SESSION_MISSING", {
//             error: `Payment session missing on cart ${final.id}`,
//         });
//     }

//     return json({ client_secret: final.payment_session.data.client_secret as string });
// };

export const GET = async ({ cookies }) => {
    const cartInfo = await checkCartExists(cookies.get("panier"));
    if (cartInfo.err) {
        return handleError(400, "CHECKOUT_POST.CART_INVALID", { cart_id: cookies.get("panier") });
    }

    if (cartInfo.cart.items.some((item) => isVariantSoldout(item.variant))) {
        return handleError(423, "CHECKOUT_POST.CART_ITEM_SOLDOUT");
    }

    if (cartInfo.cart.completed_at) {
        cookies.delete("panier", { path: "/" });
        return handleError(423, "CHECKOUT_POST.CART_ALREADY_COMPLETED", { cart_id: cartInfo.cart.id });
    }

    if (cartInfo.cart.payment_session) {
        return json({ client_secret: cartInfo.cart.payment_session.data.client_secret as string });
    }

    if (discountNotUsed(cartInfo.cart)) {
        await removeDiscounts(cartInfo.cart, "CHECKOUT_POST");
    }

    await medusa.carts.createPaymentSessions(cartInfo.cart.id).catch((err) => {
        return handleError(500, "CHECKOUT_POST.CREATE_PAYMENT_FAILED", { error: err.response.data });
    });

    const cartFinal = await medusa.carts.setPaymentSession(cartInfo.cart.id, { provider_id: "stripe" }).catch((err) => {
        return handleError(500, "CHECKOUT_POST.SET_SESSION_FAILED", { error: err.response.data });
    });

    const paymentIntent = cartFinal.cart.payment_session?.data as unknown as PaymentIntent | null;
    if (!paymentIntent) {
        return handleError(500, "CHECKOUT_GET.SESSION_EMPTY");
    }

    await stripe.paymentIntents.update(paymentIntent.id, {
        payment_method_options: {
            card: { request_three_d_secure: "challenge" },
            paypal: { preferred_locale: "fr-FR" },
        },
    });

    // stripe.paymentIntents.update("sfq", { payment_method_options: { card: { request_three_d_secure: "any" } } });

    if (!cartFinal.cart.payment_session) {
        return handleError(500, "CHECKOUT_POST.PAYEMENT_SESSION_MISSING", {
            error: `Payment session missing on cart ${cartFinal.cart.id}`,
        });
    }

    return json({ client_secret: cartFinal.cart.payment_session.data.client_secret as string });
};
