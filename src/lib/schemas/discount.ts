import { z } from "zod/v4-mini";

export const discountAddDeleteSchema = z.object({
    discount_code: z.string().check(z.minLength(1)),
});
