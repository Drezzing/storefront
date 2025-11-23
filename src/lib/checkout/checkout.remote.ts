import type { PaymentIntent } from "@stripe/stripe-js";

import { command, getRequestEvent, query } from "$app/server";
import { PaymentNotification } from "$lib/checkout/notification";
import env from "$lib/env/public";
import { handleError } from "$lib/error";
import { checkCartExists, medusa } from "$lib/medusa/medusa";
import { isVariantSoldout } from "$lib/medusa/product";
import { stripe } from "$lib/payment/stripe.js";
import { confirmationTokenData } from "$lib/schemas/checkout";
import { forceNoRefresh } from "$lib/utils";

export type ClientSecretQuery = {
    client_secret: string;
};

export const getClientSecret = query(async (): Promise<ClientSecretQuery> => {
    const request = getRequestEvent();

    const cartInfo = await checkCartExists(request.cookies.get("panier"));
    if (cartInfo.err) {
        return handleError(400, "CHECKOUT_POST.CART_INVALID", { cart_id: request.cookies.get("panier") });
    }

    if (cartInfo.cart.items.some((item) => isVariantSoldout(item.variant))) {
        return handleError(423, "CHECKOUT_POST.CART_ITEM_SOLDOUT");
    }

    if (cartInfo.cart.completed_at) {
        request.cookies.delete("panier", { path: "/" });
        return handleError(423, "CHECKOUT_POST.CART_ALREADY_COMPLETED", { cart_id: cartInfo.cart.id });
    }

    if (cartInfo.cart.payment_session) {
        return { client_secret: cartInfo.cart.payment_session.data.client_secret as string };
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

    return { client_secret: cartFinal.cart.payment_session.data.client_secret as string };
});

export const submitConfirmationToken = command(confirmationTokenData, async ({ confirmationToken }) => {
    const request = getRequestEvent();

    const cartInfo = await checkCartExists(request.cookies.get("panier"));
    if (cartInfo.err) {
        return handleError(400, "CHECKOUT_POST.CART_INVALID", { cart_id: request.cookies.get("panier") });
    }

    if (cartInfo.cart.items.some((item) => isVariantSoldout(item.variant))) {
        return handleError(423, "CHECKOUT_POST.CART_ITEM_SOLDOUT");
    }

    if (cartInfo.cart.completed_at) {
        request.cookies.delete("panier", { path: "/" });
        return handleError(423, "CHECKOUT_POST.CART_ALREADY_COMPLETED", { cart_id: cartInfo.cart.id });
    }

    if (!cartInfo.cart.payment_session) {
        return handleError(404, "CHECKOUT_POST.PAYMENT_SESSION_MISSING", {
            error: `Payment session missing on cart ${cartInfo.cart.id}`,
        });
    }

    const paymentId = cartInfo.cart.payment_session.data.id as string;
    const clientSecret = cartInfo.cart.payment_session.data.client_secret as string;

    const subcriberKey = await PaymentNotification.generateNotificationToken(clientSecret);
    const returnUrl = `/cart/complete?subscriber_key=${subcriberKey}`;

    const stripeConfirm = await stripe.paymentIntents.confirm(paymentId, {
        return_url: env.get("PUBLIC_BASE_URL") + returnUrl,
        confirmation_token: confirmationToken,
    });

    if (stripeConfirm.client_secret === null) {
        return handleError(500, "CHECKOUT_POST.CLIENT_SECRET_NULL", {
            error: `Client secret is null for payment intent ${paymentId}`,
        });
    }

    await forceNoRefresh();

    return {
        status: stripeConfirm.status,
        clientSecret: stripeConfirm.client_secret,
        redirect: returnUrl,
    };
});
