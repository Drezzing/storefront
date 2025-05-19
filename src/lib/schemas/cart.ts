import { z } from "zod/v4-mini";

export const cartName = z.regex(/^([a-zA-Zà-žÀ-Ž\- ']+)$/g);

export const cartUserDataSchema = z.object({
    firstName: cartName,
    lastName: cartName,
    mail: z.email(),
});

export const cartAddProductSchema = z.object({
    product_id: z.string().check(z.startsWith("variant_")),
    quantity: z.int().check(z.minimum(1), z.maximum(99)),
});

export const cartDeleteProductSchema = z.object({
    item_id: z.string().check(z.startsWith("item_")),
});

export type CartAddProductType = z.infer<typeof cartAddProductSchema>;
export type CartDeleteProductType = z.infer<typeof cartDeleteProductSchema>;
