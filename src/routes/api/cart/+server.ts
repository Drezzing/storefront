import { json } from "@sveltejs/kit";
import { medusa } from "$lib/medusa/medusa";
import type { RequestHandler } from "./$types";
import { CartAdd, CartDelete } from "$lib/cart/cart.js";
import { checkCartExists, checkVariantExists } from "$lib/medusa/medusa";
import { dev } from "$app/environment";

export const DELETE: RequestHandler = async ({ request, cookies }) => {
    const reqJson = await request.json();

    const defaultErrorResponse = json({ success: false }, { status: 400 });

    const { success } = CartDelete.safeParse(reqJson);
    if (!success) return defaultErrorResponse;

    const { item_id }: CartDelete = reqJson;

    const cartID = cookies.get("cart_id");
    const cartInfo = await checkCartExists(cartID);

    if (cartInfo.err) return defaultErrorResponse;

    await medusa.carts.lineItems.delete(cartInfo.cart.id, item_id);
    return json({ success: true }, { status: 200 });
};

export const POST: RequestHandler = async ({ request, getClientAddress, cookies }) => {
    const reqJson = await request.json();

    const defaultErrorResponse = json({ success: false }, { status: 400 });

    const { success } = CartAdd.safeParse(reqJson);
    if (!success) return defaultErrorResponse;

    const { product_id, quantity }: CartAdd = reqJson;

    const variantInfo = await checkVariantExists(product_id);
    if (variantInfo.err) return defaultErrorResponse;

    const cartID = cookies.get("cart_id");
    const cartInfo = await checkCartExists(cartID);

    let cart;

    // The cart exist and has not been completed yet
    if (!cartInfo.err && !cartInfo.cart.completed_at) {
        ({ cart } = await medusa.carts.lineItems.create(cartInfo.cart.id, {
            variant_id: product_id,
            quantity,
        }));
    }

    // The cart doesn't exist or is completed so we need to create a new cart
    else {
        ({ cart } = await medusa.carts.create({
            items: [{ variant_id: product_id, quantity: quantity }],
            sales_channel_id: "sc_01J5ZW52WTV7JFKGR8VECNWTQ2",
            context: {
                ip: getClientAddress(),
                user_agent: request.headers.get("user-agent"),
            },
        }));
    }

    cookies.set("cart_id", cart.id, { path: "/", secure: !dev, httpOnly: true, sameSite: "strict" });
    return json({ success: true, cart_id: cart.id }, { status: 200 });
};
