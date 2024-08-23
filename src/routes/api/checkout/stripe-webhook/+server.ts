import type { RequestHandler } from "./$types";
import { STRIPE_WEBHOOK_KEY } from "$env/static/private";
import { stripe } from "$lib/payment/stripe";
import { error } from "@sveltejs/kit";
import { medusa } from "$lib/medusa/medusa";

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature") || ("" as string);

    let event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_KEY);
    } catch {
        return error(400);
    }

    switch (event.type) {
        case "charge.succeeded": {
            const cartId = event.data.object.metadata["resource_id"] as string;
            const order = await medusa.carts.complete(cartId);

            if (order.type === "order") {
                medusa.admin.orders.capturePayment(order.data.id);
            } else {
                console.error("err");
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
