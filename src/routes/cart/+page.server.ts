import type { CartType } from "$lib/cart/cart";
import { handleError } from "$lib/error.js";
import { checkCartExists, medusa } from "$lib/medusa/medusa";

export const load = async ({ cookies }) => {
    const cartId = cookies.get("panier");

    if (cartId === undefined) {
        return { items: null } satisfies CartType;
    }

    const cartInfo = await checkCartExists(cartId);
    if (cartInfo.err) {
        return handleError(404, "CART_LOAD.CART_NOT_FOUND", { error: cartInfo.err });
    }

    const { cart } = cartInfo;
    if (cart.completed_at) {
        cookies.delete("panier", { path: "/" });
        return { items: null } satisfies CartType;
    }

    const cartVariants = cart.items.map((item) => item.variant_id!);
    const { variants } = await medusa.products.variants.list({ id: cartVariants }).catch((err) => {
        return handleError(404, "CART_LOAD.PRODUCT_VARIANTS_NOT_FOUND", { error: err.response.data });
    });

    const variantOptions = new Map<string, string[]>();
    for (const variant of variants) {
        variantOptions.set(variant.id!, variant.options?.map((option) => option.value) ?? []);
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
    } satisfies CartType;
};
