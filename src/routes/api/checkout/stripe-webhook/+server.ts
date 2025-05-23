import { paymentNotification, PaymentNotification } from "$lib/checkout/notification";
import env from "$lib/env/private";
import { handleError } from "$lib/error";
import { logger } from "$lib/logger";
import { medusa } from "$lib/medusa/medusa";
import { stripe } from "$lib/payment/stripe";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature") || "";

    const event = await stripe.webhooks.constructEventAsync(body, sig, env.get("STRIPE_WEBHOOK_KEY")).catch((err) => {
        // probably unwanted data in this error but docs have the interface of the error and i don't trust
        // chatgpt
        return handleError(400, "STRIPE_WEBHOOK_POST.INVALID_BODY", { error: err });
    });

    switch (event.type) {
        case "charge.succeeded": {
            const cartId = event.data.object.metadata["resource_id"] as string;

            const order = await medusa.carts.complete(cartId).catch((err) => {
                return handleError(500, "STRIPE_WEBHOOK_POST.CART_COMPLETE_FAIL", { error: err.response.data });
            });

            if (order.type === "order") {
                medusa.admin.orders.capturePayment(order.data.id).catch((err) => {
                    return handleError(500, "STRIPE_WEBHOOK_POST.PAYMENT_CAPTURE_FAIL", { error: err.response.data });
                });
            } else {
                logger.error(`Cart ${order.data.id} could not be converted to order (currently ${order.type})`);
            }

            break;
        }

        // User cancelled the payment
        case "payment_intent.canceled": {
            const cartId = event.data.object.metadata["resource_id"] as string;
            await medusa.carts.deletePaymentSession(cartId, "stripe");
            break;
        }

        // User tried paying but authorization failed and payment is not valid.
        case "payment_intent.payment_failed": {
            const clientSecret = event.data.object.client_secret;
            if (!clientSecret) {
                break;
            }

            const subscriberKey = await PaymentNotification.generateNotificationToken(clientSecret);
            paymentNotification.setStatus(subscriberKey, "failed");
            break;
        }

        case "payment_intent.succeeded": {
            const clientSecret = event.data.object.client_secret;
            if (!clientSecret) {
                break;
            }

            const subscriberKey = await PaymentNotification.generateNotificationToken(clientSecret);
            paymentNotification.setStatus(subscriberKey, "success");
            break;
        }
    }

    return new Response(null, { status: 200 });
};
