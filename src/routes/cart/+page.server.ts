import type { CartType } from "$lib/cart/cart";
import { checkCartExists, medusa } from "$lib/medusa/medusa";

export const load = async ({ cookies }) => {
    const cartInfo = await checkCartExists(cookies.get("cart_id"));

    if (cartInfo.err) {
        return { items: null } satisfies CartType;
    }

    const { cart } = cartInfo;
    if (cart.completed_at) {
        cookies.delete("cart_id", { path: "/" });
        return { items: null } satisfies CartType;
    }

    const cartVariants = cart.items.map((item) => item.variant_id!);
    const { variants } = await medusa.products.variants.list({ id: cartVariants });

    const variantOptions = new Map<string, string[]>();
    for (const variant of variants) {
        variantOptions.set(variant.id!, variant.options?.map((option) => option.value) ?? []);
    }

    return {
        items: cart.items.map((item) => {
            return {
                id: item.id,
                title: item.title,
                thumbnail: item.thumbnail ?? "https://via.placeholder.com/600x600",
                quantity: item.quantity,
                price: item.unit_price,
                options: variantOptions.get(item.variant_id!),
            };
        }),
    } satisfies CartType;
};
