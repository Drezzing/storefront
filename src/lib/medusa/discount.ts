import { z } from "zod";

export type DiscountType = {
    code: string;
    amount: number;
    type: "fixed" | "percentage" | "free_shipping";
};

export const DiscountAddDelete = z.object({
    discount_code: z.string().min(1),
});
