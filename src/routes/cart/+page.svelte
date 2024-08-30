<script lang="ts">
    let { data } = $props();
    let { items } = $state(data);

    import { Separator } from "$lib/components/ui/separator/index.js";
    import CartItem from "$lib/cart/CartItem.svelte";
    import CartStripe from "$lib/cart/CartStripe.svelte";
    import { clientRequest, displayClientError } from "$lib/error.js";

    let itemCount = $derived.by(() => (items ? items.length : 0));

    let total = $derived.by(() => {
        let s = 0;
        for (const item of items ?? []) {
            s += item.quantity * item.price;
        }
        return s;
    });

    const deleteCartItem = async (itemID: string) => {
        if (!items) return;

        items = items.filter((item) => item.id !== itemID);

        const response = await clientRequest("CART_CART_DELETE", "/api/cart", {
            method: "DELETE",
            body: JSON.stringify({ item_id: itemID }),
        });

        if (!response.success) {
            displayClientError(response);
        }
    };
</script>

<svelte:head>
    <title>Panier</title>
    <meta name="description" content="Voir le contenu de mon panier" />
</svelte:head>

<div class="px-4 md:mx-auto md:max-w-[1350px]">
    <div>
        <h1 class="text-2xl font-bold">Mon panier</h1>
        <p>{itemCount} article{itemCount > 1 ? "s" : ""}</p>
    </div>

    <Separator class="my-4" />

    {#if items && itemCount}
        <div class="flex flex-col items-start justify-center gap-4 md:flex-row lg:gap-8">
            <div class="w-full grow space-y-4 md:w-auto">
                {#each items as item}
                    <CartItem {item} {deleteCartItem} />
                {/each}
            </div>

            <Separator class="h-full w-4" orientation="vertical" />

            <div class="w-full rounded md:w-[min(24rem,40vw)] lg:w-96">
                <h2 class="text-xl font-semibold">Total :</h2>
                <p>{(total / 100).toFixed(2)}€ TTC</p>

                <Separator class="my-4" />

                <p>La réception de votre achat se fera en main propre au BDE ISIMA.</p>

                <CartStripe />
            </div>
        </div>
    {:else}
        <p class="flex h-32 items-center justify-center font-bold">Votre panier est vide.</p>
    {/if}
</div>
