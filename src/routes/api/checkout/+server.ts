// import { json } from "@sveltejs/kit";
// import { checkCartExists, medusa } from "$lib/medusa/medusa";
// import { CartUserData } from "$lib/cart/cart";
import { handleError } from "$lib/error.js";

// export const POST = async ({ cookies, request }) => {
//     const cartInfo = await checkCartExists(cookies.get("panier"));
//     if (cartInfo.err) {
//         return handleError(400, "CHECKOUT_POST.CART_INVALID", { cart_id: cookies.get("panier") });
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

export const POST = async () => {
    return handleError(403, "CHECKOUT_POST.DISABLED");
};
