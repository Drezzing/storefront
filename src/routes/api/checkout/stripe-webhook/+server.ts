import type { RequestHandler } from "./$types";
import { STRIPE_WEBHOOK_KEY } from "$env/static/private";
import { stripe } from "$lib/payment/stripe";
import { medusa } from "$lib/medusa/medusa";
import { handleError } from "$lib/error";
import { logger } from "$lib/logger";

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature") || ("" as string);

    const event = await stripe.webhooks.constructEventAsync(body, sig, STRIPE_WEBHOOK_KEY).catch((err) => {
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

            // TODO: send mail with order info

            break;
        }

        // User cancelled the payment
        case "payment_intent.canceled": {
            break;
        }

        // User tried paying but authorization failed and payment is not valid.
        case "payment_intent.payment_failed": {
            // TODO : Send mail to user to imform them payment failed -> attach metadata to payment_intent in
            // /cart/complete & check here if metadata is present, then send mail if needed

            break;
        }
    }

    return new Response(null, { status: 200 });
};
