import { handleError } from "$lib/error";

import { medusa, type MedusaCart } from "./medusa";

export type DiscountType = {
    code: string;
    amount: number;
    type: "fixed" | "percentage" | "free_shipping";
};

export const removeUnusedDiscounts = async (cart: MedusaCart, caller: string) => {
    const unsed = cart.discounts.filter((discount) => {
        if (discount.rule.type === "free_shipping") return false;
        const used = cart.items.some((item) => {
            return item.adjustments.some((adjustment) => {
                return adjustment.discount_id === discount.id;
            });
        });

        return !used;
    });

    return await Promise.all(
        unsed.map((discount) => {
            medusa.carts.deleteDiscount(cart.id, discount.code).catch((err) => {
                return handleError(500, caller + ".DELETE_DISCOUNT_FAILED", {
                    code: discount.code,
                    error: err.response.data,
                });
            });

            return discount.code;
        }),
    );
};
