import { command, getRequestEvent, query } from "$app/server";
import { handleError } from "$lib/error";
import { removeUnusedDiscounts, type DiscountType } from "$lib/medusa/discount";
import { checkCartExists, checkDiscountExist, medusa } from "$lib/medusa/medusa";
import { discountAddOrDeleteSchema } from "$lib/schemas/discount";
import { forceNoRefresh } from "$lib/utils";

export const test = query("unchecked", () => {});

export const addDiscountToCart = command(discountAddOrDeleteSchema, async ({ discount_code }) => {
    const request = getRequestEvent();
    const cart = request.cookies.get("panier");

    const [cartInfo, discountInfo] = await Promise.all([checkCartExists(cart), checkDiscountExist(discount_code)]);

    if (cartInfo.err) {
        return handleError(404, "DISCOUNT_POST.CART_NOT_EXIST", cartInfo.err);
    }

    if (discountInfo.err) {
        return handleError(
            404,
            {
                message: "DISCOUNT_POST.DISCOUNT_NOT_EXIST",
                userMessage: "Ce code promotionnel n'existe pas.",
            },
            discountInfo.err,
        );
    }

    if (cartInfo.cart.discounts.length >= 1) {
        await Promise.all(
            cartInfo.cart.discounts.map((discount) => {
                medusa.carts.deleteDiscount(cartInfo.cart.id, discount.code);
            }),
        );
    }

    const cartUpdated = await medusa.carts.update(cartInfo.cart.id, {
        discounts: [{ code: discountInfo.discount.code }],
    });

    const removedDiscounts = await removeUnusedDiscounts(cartUpdated.cart, "DISCOUNT_POST").catch((err) => {
        return handleError(500, "DISCOUNT_POST.DELETE_DISCOUNT_FAILED", err);
    });

    if (removedDiscounts.includes(discountInfo.discount.code)) {
        return handleError(409, {
            message: "DISCOUNT_POST.DISCOUNT_NOT_VALID",
            userMessage: "Ce code promotionnel n'est pas applicable aux articles de ce panier.",
        });
    }

    const discountReturn = {
        total: cartUpdated.cart.total || 0,
        discount: {
            code: discountInfo.discount.code,
            amount: discountInfo.discount.rule.value,
            type: discountInfo.discount.rule.type,
        },
    } satisfies { total: number; discount: DiscountType };

    await forceNoRefresh();

    return discountReturn;
});

export const deleteDiscountFromCart = command(discountAddOrDeleteSchema, async ({ discount_code }) => {
    const request = getRequestEvent();
    const cart = request.cookies.get("panier");

    const [cartInfo, discountInfo] = await Promise.all([checkCartExists(cart), checkDiscountExist(discount_code)]);

    if (cartInfo.err) {
        return handleError(404, "DISCOUNT_DELETE.CART_NOT_EXIST", cartInfo.err);
    }

    if (discountInfo.err) {
        return handleError(404, "DISCOUNT_DELETE.DISCOUNT_NOT_EXIST", discountInfo.err);
    }

    const cartUpdated = await medusa.carts.deleteDiscount(cartInfo.cart.id, discountInfo.discount.code).catch((err) => {
        return handleError(500, "DISCOUNT_DELETE.DISCOUNT_DELETE_FAILED", err.response.data);
    });

    await forceNoRefresh();

    return { total: cartUpdated.cart.total || 0 };
});
