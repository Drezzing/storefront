import type { DiscountType } from "$lib/medusa/discount";

export type CartItemType = {
    id: string;
    title: string;
    handle: string;
    thumbnail: string;
    quantity: number;
    price: number;
    options?: string[];
};

export type CartType = {
    items: CartItemType[] | null;
    discount: DiscountType | null;
    total: number;
};
