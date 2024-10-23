import { json } from "@sveltejs/kit";
import { handleError } from "$lib/error.js";
import { medusa } from "$lib/medusa/medusa";
import { CartAdd, CartDelete } from "$lib/cart/cart.js";
import { checkCartExists, checkVariantExists } from "$lib/medusa/medusa";
import { dev } from "$app/environment";
import { DEFAULT_SHIPPING_ID, MEDUSA_SALES_CHANNEL } from "$env/static/private";
import { PUBLIC_REGION_ID } from "$env/static/public";

export const DELETE = async ({ request, cookies }) => {
    const reqJson = await request.json().catch(async () => {
        return handleError(400, "CART_DELETE.INVALID_BODY", { body: await request.text() });
    });

    const cartDeleteValid = CartDelete.safeParse(reqJson);
    if (!cartDeleteValid.success) {
        return handleError(422, "CART_DELETE.INVALID_DATA", { data: reqJson });
    }

    const cartInfo = await checkCartExists(cookies.get("panier"));
    if (cartInfo.err) {
        return handleError(404, "CART_DELETE.CART_NOT_FOUND", { error: cartInfo.err });
    }

    await medusa.carts.lineItems.delete(cartInfo.cart.id, cartDeleteValid.data.item_id).catch((err) => {
        return handleError(500, "CART_DELETE.ITEM_DELETE_FAIL", { error: err.response.data });
    });

    return json(null, { status: 200 });
};

export const POST = async ({ request, getClientAddress, cookies }) => {
    const reqJson = await request.json().catch(async () => {
        return handleError(400, "CART_POST.INVALID_BODY", { body: await request.text() });
    });

    const cartAddValid = CartAdd.safeParse(reqJson);
    if (!cartAddValid.success) {
        return handleError(422, "CART_POST.INVALID_DATA", { data: reqJson });
    }

    const variantInfo = await checkVariantExists(cartAddValid.data.product_id);
    if (variantInfo.err) {
        return handleError(404, "CART_POST.VARIANT_NOT_FOUND", { error: variantInfo.err });
    }

    let cart;
    const cartID = cookies.get("panier");
    if (cartID) {
        const cartInfo = await checkCartExists(cartID);
        if (cartInfo.err) {
            return handleError(404, "CART_POST.CART_NOT_FOUND", { error: cartInfo.err });
        }

        // The cart exist and has not been completed yet
        if (!cartInfo.cart.completed_at) {
            ({ cart } = await medusa.carts.lineItems
                .create(cartInfo.cart.id, {
                    variant_id: cartAddValid.data.product_id,
                    quantity: cartAddValid.data.quantity,
                })
                .catch((err) => {
                    return handleError(500, "CART_POST.CART_ADD_ITEM_FAIL", { error: err.response.data });
                }));
        } else {
            cookies.delete("panier", { path: "/" });
            return handleError(423, "CART_POST.CART_ALREADY_COMPLETED", { cart_id: cartInfo.cart.id });
        }
    }

    // The cart doesn't exist or is completed so we need to create a new cart
    else {
        ({ cart } = await medusa.carts
            .create({
                items: [{ variant_id: cartAddValid.data.product_id, quantity: cartAddValid.data.quantity }],
                sales_channel_id: MEDUSA_SALES_CHANNEL,
                region_id: PUBLIC_REGION_ID,
                context: {
                    ip: getClientAddress(),
                    user_agent: request.headers.get("user-agent"),
                },
            })
            .catch((err) => {
                return handleError(500, "CART_POST.CART_CREATE_FAIL", { error: err.response.data });
            }));
        await medusa.carts.addShippingMethod(cart.id, {
            option_id: DEFAULT_SHIPPING_ID,
        });
    }

    cookies.set("panier", cart.id, {
        path: "/",
        secure: !dev,
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30, // 1 mounth
    });
    return json({ success: true, cart_id: cart.id }, { status: 200 });
};
