import { dev } from "$app/environment";
import { command, getRequestEvent } from "$app/server";
import env from "$lib/env/private";
import { handleError } from "$lib/error";
import { removeUnusedDiscounts } from "$lib/medusa/discount";
import { checkCartExists, checkVariantExists, medusa } from "$lib/medusa/medusa";
import { isVariantSoldout } from "$lib/medusa/product";
import { cartAddProductSchema, cartDeleteProductSchema } from "$lib/schemas/cart";
import { forceNoRefresh } from "$lib/utils";

export const addProductToCart = command(cartAddProductSchema, async ({ product_id, quantity }) => {
    const request = getRequestEvent();

    const variantInfo = await checkVariantExists(product_id);
    if (variantInfo.err) {
        return handleError(404, "CART_POST.VARIANT_NOT_FOUND", { error: variantInfo.err });
    }

    if (isVariantSoldout(variantInfo.variant)) {
        return handleError(423, "CART_POST.VARIANT_SOLD_OUT", { variant: variantInfo.variant.id });
    }

    let cart;
    const cartID = request.cookies.get("panier");
    if (cartID) {
        const cartInfo = await checkCartExists(cartID);
        if (cartInfo.err) {
            return handleError(404, "CART_POST.CART_NOT_FOUND", { error: cartInfo.err });
        }

        // The cart exist and has not been completed yet
        if (!cartInfo.cart.completed_at) {
            ({ cart } = await medusa.carts.lineItems
                .create(cartInfo.cart.id, {
                    variant_id: product_id,
                    quantity: quantity,
                })
                .catch((err) => {
                    return handleError(500, "CART_POST.CART_ADD_ITEM_FAIL", { error: err.response.data });
                }));
        } else {
            request.cookies.delete("panier", { path: "/" });
            return handleError(423, "CART_POST.CART_ALREADY_COMPLETED", { cart_id: cartInfo.cart.id });
        }
    }

    // The cart doesn't exist or is completed so we need to create a new cart
    else {
        ({ cart } = await medusa.carts
            .create({
                items: [{ variant_id: product_id, quantity: quantity }],
                sales_channel_id: env.get("MEDUSA_SALES_CHANNEL_ID"),
                region_id: env.get("MEDUSA_REGION_ID"),
                context: {
                    ip: request.getClientAddress(),
                },
            })
            .catch((err) => {
                return handleError(500, "CART_POST.CART_CREATE_FAIL", { error: err.response.data });
            }));
    }

    request.cookies.set("panier", cart.id, {
        path: "/",
        secure: !dev,
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30, // 1 mounth
    });

    await forceNoRefresh();
});

export const removeCartItem = command(cartDeleteProductSchema, async ({ item_id }) => {
    const request = getRequestEvent();

    const cartInfo = await checkCartExists(request.cookies.get("panier"));
    if (cartInfo.err) {
        return handleError(404, "CART_DELETE.CART_NOT_FOUND", { error: cartInfo.err });
    }

    const cartProduct = cartInfo.cart.items.find((item) => item.id === item_id);
    if (cartProduct === undefined) {
        return handleError(404, "CART_DELETE.ITEM_NOT_FOUND", {
            cart_id: cartInfo.cart.id,
            item_id: item_id,
        });
    }

    const cartUpdated = await medusa.carts.lineItems.delete(cartInfo.cart.id, cartProduct.id).catch((err) => {
        return handleError(500, "CART_DELETE.ITEM_DELETE_FAIL", { error: err.response.data });
    });

    const removedDiscounts = await removeUnusedDiscounts(cartUpdated.cart, "CART_DELETE");

    await forceNoRefresh();

    return { total: cartUpdated.cart.total || 0, discart_discount: removedDiscounts.length >= 1 };
});
