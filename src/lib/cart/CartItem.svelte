<script lang="ts">
    import type { CartItemType } from "$lib/cart/cart";
    import CartDeleteButton from "$lib/cart/CartDeleteButton.svelte";
    import { displayRemoteFunctionError } from "$lib/error";
    import type { DiscountType } from "$lib/medusa/discount";
    import { removeCartItem } from "./cart.remote";

    let {
        total = $bindable(),
        items = $bindable(),
        discount = $bindable(),
        item,
    }: { total: number; items: CartItemType[]; discount: DiscountType | null; item: CartItemType } = $props();

    const deleteCartItem = async (itemID: string) => {
        if (!items) return;

        try {
            const response = await removeCartItem({ item_id: itemID });
            items = items.filter((item) => item.id !== itemID);
            total = response.total;
            if (response.discart_discount) {
                discount = null;
            }
        } catch (e) {
            displayRemoteFunctionError(e);
        }
    };
</script>

<div class="grid grid-cols-[30%_1fr] grid-rows-2 gap-x-4 lg:grid-cols-[auto_1fr_auto] lg:grid-rows-1">
    <div class="row-span-2 max-h-48">
        <a href="/products/{item.handle}" target="_blank">
            <img src={item.thumbnail} alt={item.title} class="max-h-48" />
        </a>
    </div>
    <div class="self-center">
        <a href="/products/{item.handle}" target="_blank" class="block w-fit">
            <p class="w-fit font-bold">
                {item.title}
                {item.options ? " - " + item.options.join(" - ") : ""}
            </p>
        </a>
        <p>{((item.price * item.quantity) / 100).toFixed(2)}€</p>
    </div>
    <div class="flex w-full items-center gap-4 self-center">
        <div>
            Quantité :
            <span class="ml-1 rounded-md px-4 py-1 ring-[1.5px] ring-black">{item.quantity}</span>
        </div>

        <CartDeleteButton onclick={() => deleteCartItem(item.id)} />
    </div>
</div>
