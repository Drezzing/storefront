import { z } from "zod/v4-mini";

export const discountAddOrDeleteSchema = z.object({
    discount_code: z.string().check(z.minLength(1)),
});
