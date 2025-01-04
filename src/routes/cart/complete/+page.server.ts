import { handleError } from "$lib/error.js";
import { paymentNotification } from "$lib/checkout/notification.js";

export const csr = true;
export const ssr = false;

export const load = async ({ url, cookies }) => {
    const subscriberKey = url.searchParams.get("subscriber_key");
    if (!subscriberKey) {
        return handleError(400, "CART_COMPLETE_LOAD.MISSING_PARAM");
    }

    const currentStatus = await paymentNotification.getStatus(subscriberKey);

    cookies.delete("panier", { path: "/" });
    return { subscriberKey, currentStatus };
};
