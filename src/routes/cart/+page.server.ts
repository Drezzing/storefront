import { getCartById, type CartType } from "$lib/cart/cart";

export const load = async ({ cookies }) => {
    const cartId = cookies.get("panier");
    const cart = await getCartById(cartId);

    if (cart === null) {
        cookies.delete("panier", { path: "/" });
    }

    return cart ?? ({ items: null, discount: null, total: 0 } satisfies CartType);
};
