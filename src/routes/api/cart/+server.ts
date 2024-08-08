import { json } from "@sveltejs/kit";
import { medusa } from "$lib/medusa/medusa";
import type { RequestHandler } from "./$types";
import { CartAdd } from "$lib/medusa/cart";
import { checkCartExists, checkVariantExists } from "$lib/medusa/medusa";
import { dev } from "$app/environment";

export const POST: RequestHandler = async ({ request, getClientAddress, cookies }) => {
    const reqJson = await request.json();

    const defaultErrorResponse = json({ success: false }, { status: 400 });

    const { success } = CartAdd.safeParse(reqJson);
    if (!success) return defaultErrorResponse;

    const { product_id, quantity }: CartAdd = reqJson;

    console.log(reqJson);

    const variantInfo = await checkVariantExists(product_id);
    if (variantInfo.exist === false) return defaultErrorResponse;

    const cartID = cookies.get("cart_id");
    const cartInfo = await checkCartExists(cartID);

    let cart;
    if (cartInfo.exist) {
        ({ cart } = await medusa.carts.lineItems.create(cartInfo.cart.id, {
            variant_id: product_id,
            quantity,
        }));
    } else {
        ({ cart } = await medusa.carts.create({
            items: [{ variant_id: product_id, quantity: quantity }],
            sales_channel_id: "sc_01J4M81SYPHDB5PS61DYEQR7XN",
            context: {
                ip: getClientAddress(),
                user_agent: request.headers.get("user-agent"),
            },
        }));
    }

    cookies.set("cart_id", cart.id, { path: "/", secure: !dev, httpOnly: true });
    return json({ success: true, cart_id: cart.id }, { status: 200 });
};
