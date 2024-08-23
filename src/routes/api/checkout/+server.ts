import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import { z } from "zod";
import { checkCartExists, medusa } from "$lib/medusa/medusa";

export const POST: RequestHandler = async ({ cookies, request }) => {
    const cartInfo = await checkCartExists(cookies.get("cart_id"));

    if (cartInfo.err) return json({ success: false, client_secret: null }, { status: 400 });
    if (cartInfo.cart.completed_at) return json({ success: false, client_secret: null }, { status: 400 });

    if (cartInfo.cart.payment_session) {
        return json({ success: true, client_secret: cartInfo.cart.payment_session.data.client_secret as string });
    }

    const reqJson = await request.json();
    const userMail = reqJson["mail"] as string;

    const mailParse = z.string().email().safeParse(userMail);
    if (!mailParse.success) return json({ success: false, client_secret: null }, { status: 400 });

    const { cart } = await medusa.carts.update(cartInfo.cart.id, {
        email: userMail,
    });

    await medusa.carts.createPaymentSessions(cart.id);
    const { cart: final } = await medusa.carts.setPaymentSession(cartInfo.cart.id, { provider_id: "stripe" });

    if (!final.payment_session) {
        return json({ success: false, client_secret: null }, { status: 500 });
    }

    console.log(cartInfo.cart.id, cart.id, final.id);

    return json({ success: true, client_secret: final.payment_session.data.client_secret as string });
};
