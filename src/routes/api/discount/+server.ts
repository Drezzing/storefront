import { handleError } from "$lib/error.js";
import { DiscountAddDelete, removeUnusedDiscounts, type DiscountType } from "$lib/medusa/discount.js";
import { checkCartExists, checkDiscountExist, medusa } from "$lib/medusa/medusa";
import { json } from "@sveltejs/kit";

export const POST = async ({ cookies, request }) => {
    const cart = cookies.get("panier");

    const reqJson = await request.json().catch(async () => {
        return handleError(400, "DISCOUNT_POST.INVALID_BODY", { body: await request.text() });
    });

    const discountAddValid = DiscountAddDelete.safeParse(reqJson);
    if (!discountAddValid.success) {
        return handleError(422, "DISCOUNT_POST.INVALID_DATA", { data: reqJson });
    }

    const [cartInfo, discountInfo] = await Promise.all([
        checkCartExists(cart),
        checkDiscountExist(discountAddValid.data.discount_code),
    ]);

    if (cartInfo.err) {
        return handleError(404, "DISCOUNT_POST.CART_NOT_EXIST", cartInfo.err);
    }

    if (discountInfo.err) {
        return handleError(404, "DISCOUNT_POST.DISCOUNT_NOT_EXIST", discountInfo.err);
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

    return json(discountReturn, { status: 200 });
};

export const DELETE = async ({ cookies, request }) => {
    const cart = cookies.get("panier");

    const reqJson = await request.json().catch(async () => {
        return handleError(400, "DISCOUNT_DELETE.INVALID_BODY", { body: await request.text() });
    });

    const discountAddValid = DiscountAddDelete.safeParse(reqJson);
    if (!discountAddValid.success) {
        return handleError(422, "DISCOUNT_DELETE.INVALID_DATA", { data: reqJson });
    }

    const [cartInfo, discountInfo] = await Promise.all([
        checkCartExists(cart),
        checkDiscountExist(discountAddValid.data.discount_code),
    ]);

    if (cartInfo.err) {
        return handleError(404, "DISCOUNT_DELETE.CART_NOT_EXIST", cartInfo.err);
    }

    if (discountInfo.err) {
        return handleError(404, "DISCOUNT_DELETE.DISCOUNT_NOT_EXIST", discountInfo.err);
    }

    const cartUpdated = await medusa.carts.deleteDiscount(cartInfo.cart.id, discountInfo.discount.code).catch((err) => {
        return handleError(500, "DISCOUNT_DELETE.DISCOUNT_DELETE_FAILED", err.response.data);
    });

    return json({ total: cartUpdated.cart.total || 0 });
};
