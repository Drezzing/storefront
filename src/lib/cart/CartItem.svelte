<script lang="ts">
    import trash from "$lib/images/trash.svg?raw";

    import { Button } from "$lib/components/ui/button/index.js";
    import type { CartItemType } from "./cart";
    import { PUBLIC_BASE_URL } from "$env/static/public";
    import { clientRequest, displayClientError } from "$lib/error";

    let {
        total = $bindable(),
        items = $bindable(),
        item,
    }: { total: number; items: CartItemType[]; item: CartItemType } = $props();

    const deleteCartItem = async (itemID: string) => {
        if (!items) return;

        items = items.filter((item) => item.id !== itemID);

        const response = await clientRequest<{ total: number }>("CART_CART_DELETE", "/api/cart", {
            method: "DELETE",
            body: JSON.stringify({ item_id: itemID }),
        });

        if (!response.success) {
            displayClientError(response);
        } else {
            total = response.data.total;
        }
    };
</script>

<div class="grid grid-cols-[30%_1fr] grid-rows-2 gap-x-4 lg:grid-cols-[auto_1fr_auto] lg:grid-rows-1">
    <div class="row-span-2 max-h-48">
        <a href="{PUBLIC_BASE_URL}/products/{item.handle}" target="_blank">
            <img src={item.thumbnail} alt={item.title} class="max-h-48" />
        </a>
    </div>
    <div class="self-center">
        <a href="{PUBLIC_BASE_URL}/products/{item.handle}" target="_blank" class="block w-fit">
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
        <Button
            class="h-auto flex-wrap gap-x-1 gap-y-2 bg-transparent stroke-black py-1 font-normal text-black ring-[1.5px] ring-black transition-all duration-75 hover:bg-transparent hover:stroke-red-600 hover:ring-red-600"
            onclick={() => deleteCartItem(item.id)}
        >
            <div class="h-5 w-4 fill-none text-transparent">
                {@html trash}
            </div>
        </Button>
    </div>
</div>
