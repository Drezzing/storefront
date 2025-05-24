import { type PaymentIntent } from "@stripe/stripe-js";
import { json } from "@sveltejs/kit";

import { PaymentNotification } from "$lib/checkout/notification.js";
import env from "$lib/env/public";
import { handleError } from "$lib/error";
import { checkCartExists, medusa } from "$lib/medusa/medusa";
import { isVariantSoldout } from "$lib/medusa/product";
import { stripe } from "$lib/payment/stripe.js";
import { confirmationTokenData } from "$lib/schemas/checkout";

/**
 * POST /api/checkout
 * Submit the confirmation token to Stripe to confirm the payment intent.
 */
export const POST = async ({ cookies, request }) => {
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

    if (!cartInfo.cart.payment_session) {
        return handleError(404, "CHECKOUT_POST.PAYMENT_SESSION_MISSING", {
            error: `Payment session missing on cart ${cartInfo.cart.id}`,
        });
    }

    const reqJson = await request.json().catch(async () => {
        return handleError(400, "CHECKOUT_POST.INVALID_BODY", { body: await request.text() });
    });

    const confirmationTokenValid = confirmationTokenData.safeParse(reqJson);
    if (!confirmationTokenValid.success) {
        return handleError(422, "CHECKOUT_POST.INVALID_DATA", { data: reqJson });
    }

    const paymentId = cartInfo.cart.payment_session.data.id as string;
    const clientSecret = cartInfo.cart.payment_session.data.client_secret as string;

    const subcriberKey = await PaymentNotification.generateNotificationToken(clientSecret);
    const returnUrl = `/cart/complete?subscriber_key=${subcriberKey}`;

    const stripeConfirm = await stripe.paymentIntents.confirm(paymentId, {
        return_url: env.get("PUBLIC_BASE_URL") + returnUrl,
        confirmation_token: confirmationTokenValid.data.confirmationToken,
    });

    if (stripeConfirm.client_secret === null) {
        return handleError(500, "CHECKOUT_POST.CLIENT_SECRET_NULL", {
            error: `Client secret is null for payment intent ${paymentId}`,
        });
    }

    return json({
        status: stripeConfirm.status,
        clientSecret: stripeConfirm.client_secret,
        redirect: returnUrl,
    });
};

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

    if (!cartFinal.cart.payment_session) {
        return handleError(500, "CHECKOUT_POST.PAYEMENT_SESSION_MISSING", {
            error: `Payment session missing on cart ${cartFinal.cart.id}`,
        });
    }

    return json({ client_secret: cartFinal.cart.payment_session.data.client_secret as string });
};
