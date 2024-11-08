import { z } from "zod";
import { medusa, type MedusaCart } from "./medusa";
import { handleError } from "$lib/error";

export type DiscountType = {
    code: string;
    amount: number;
    type: "fixed" | "percentage" | "free_shipping";
};

export const DiscountAddDelete = z.object({
    discount_code: z.string().min(1),
});

export const discountNotUsed = (cart: MedusaCart) => {
    const cartHasDiscount = cart.discounts.length >= 1;
    const discoutIsUsed = (cart.discount_total || 0) == 0;
    return cartHasDiscount && discoutIsUsed;
};

export const removeDiscounts = async (cart: MedusaCart, caller: string) => {
    return await Promise.all(
        cart.discounts.map((discount) =>
            medusa.carts.deleteDiscount(cart.id, discount.code).catch((err) => {
                return handleError(500, caller + ".DELETE_DISCOUNT_FAILED", {
                    code: discount.code,
                    error: err.response.data,
                });
            }),
        ),
    );
};
