import { paymentNotification } from "$lib/checkout/notification.js";
import { handleError } from "$lib/error.js";

export async function GET({ url }) {
    const subscriberKey = url.searchParams.get("subscriber_key");

    if (!subscriberKey) {
        return handleError(401, "");
    }

    const stream = new ReadableStream({
        start(controller) {
            paymentNotification.setController(subscriberKey, controller);
        },
        cancel() {
            paymentNotification.deleteController(subscriberKey);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
        },
    });
}
