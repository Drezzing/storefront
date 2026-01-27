import { handleError } from "$lib/error";
import type { DiscountType } from "$lib/medusa/discount";
import { checkCartExists, medusa } from "$lib/medusa/medusa";

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

/**
 * Get a cart by its ID
 * @param cartId The ID of the cart to retrieve
 * @returns The cart data or null if not found or completed
 */
export const getCartById = async (cartId: string | undefined): Promise<CartType | null> => {
    if (cartId === undefined) {
        return null;
    }

    const cartInfo = await checkCartExists(cartId);
    if (cartInfo.err) {
        return handleError(404, "GET_CART_BY_ID.CART_NOT_FOUND", { error: cartInfo.err, cartId });
    }

    const { cart } = cartInfo;
    if (cart.completed_at) {
        return null;
    }

    const cartVariants = cart.items.map((item) => item.variant_id!);
    const { variants } = await medusa.products.variants.list({ id: cartVariants }).catch((err) => {
        return handleError(404, "GET_CART_BY_ID.PRODUCT_VARIANTS_NOT_FOUND", { error: err.response.data, cartId });
    });

    const variantOptions = new Map<string, string[]>();
    for (const variant of variants) {
        variantOptions.set(variant.id!, variant.options?.map((option) => option.value) ?? []);
    }

    let discoutInfo: DiscountType | null = null;
    if (cart.discounts.length >= 1) {
        discoutInfo = {
            code: cart.discounts[0].code,
            amount: cart.discounts[0].rule.value,
            type: cart.discounts[0].rule.type,
        };
    }

    return {
        items: cart.items.map((item) => {
            return {
                id: item.id,
                title: item.title,
                handle: item.variant.product.handle ?? "/",
                thumbnail: item.thumbnail ?? "https://via.placeholder.com/600x600",
                quantity: item.quantity,
                price: item.unit_price,
                options: variantOptions.get(item.variant_id!),
            };
        }),
        discount: discoutInfo,
        total: cart.total || 0,
    };
};
