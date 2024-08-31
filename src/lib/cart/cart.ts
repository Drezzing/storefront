import { z } from "zod";

export type CartItemType = {
    id: string;
    title: string;
    handle: string;
    thumbnail: string;
    quantity: number;
    price: number;
    options?: string[];
};

export const CartName = z.string().regex(/^([a-zA-Zà-žÀ-Ž\- ']+)$/g);

export const CartUserData = z.object({
    firstName: CartName,
    lastName: CartName,
    mail: z.string().email(),
});

export type CartType = {
    items: CartItemType[] | null;
};

export const CartAdd = z.object({
    product_id: z.string().startsWith("variant_"),
    quantity: z.number().min(1).max(99),
});

export type CartAdd = z.infer<typeof CartAdd>;

export const CartDelete = z.object({
    item_id: z.string().startsWith("item_"),
});

export type CartDelete = z.infer<typeof CartDelete>;
