<script lang="ts">
    let { data } = $props();
    let { items, total, discount } = $state(data);

    import { LoaderCircle } from "lucide-svelte";
    import { SendHorizontal } from "lucide-svelte";
    import { Check } from "lucide-svelte";
    import { X } from "lucide-svelte";
    import { Tag } from "lucide-svelte";
    import trash from "$lib/images/trash.svg?raw";

    import { Separator } from "$lib/components/ui/separator/index.js";
    import CartItem from "$lib/cart/CartItem.svelte";
    import CartStripe from "$lib/cart/CartStripe.svelte";
    import { clientRequest, displayClientError } from "$lib/error.js";
    import Input from "$lib/components/ui/input/input.svelte";
    import Button from "$lib/components/ui/button/button.svelte";

    import StateButton from "$lib/components/StateButton/StateButton.svelte";
    import { ButtonState } from "$lib/components/StateButton/stateButton";
    import { toast } from "svelte-sonner";
    import type { DiscountType } from "$lib/medusa/discount.js";
    import Label from "$lib/components/ui/label/label.svelte";

    let itemCount = $derived.by(() => (items ? items.length : 0));

    let discountState = $state(ButtonState.Idle);
    let discountCode = $state("");

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

    const postCartDiscount = async (e: SubmitEvent) => {
        e.preventDefault();

        if (discountCode.length < 1) {
            return;
        }

        discountState = ButtonState.Updating;

        const response = await clientRequest<{ total: number; discount: DiscountType }>(
            "DISCOUNT_CART_POST",
            "/api/discount",
            {
                method: "POST",
                body: JSON.stringify({ discount_code: discountCode }),
            },
        );

        if (!response.success) {
            toast.error("Code promotionnel non valide.");
            discountState = ButtonState.Fail;
        } else {
            discountState = ButtonState.Success;
            discountCode = "";
            discount = response.data.discount;
            total = response.data.total;
        }

        setTimeout(() => (discountState = ButtonState.Idle), 2500);
    };

    const deleteCartDiscount = async () => {
        if (discount == null) {
            return;
        }

        const code = discount.code;

        discountState = ButtonState.Idle;
        discountCode = "";
        discount = null;

        const response = await clientRequest<{ total: number }>("CART_CART_DELETE", "/api/discount", {
            method: "DELETE",
            body: JSON.stringify({ discount_code: code }),
        });

        if (!response.success) {
            displayClientError(response);
        } else {
            total = response.data.total;
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

                {#if discount == null}
                    <Separator />
                    <form class="flex flex-row items-center gap-2" onsubmit={postCartDiscount}>
                        <Label for="discount-code" class="w-auto shrink-0 text-base">Code promotionnel :</Label>
                        <Input id="discount-code" class="h-12 focus-visible:ring-offset-0" bind:value={discountCode} />
                        <div class="w-auto">
                            <StateButton buttonState={discountState} type="submit">
                                {#if discountState == ButtonState.Idle}
                                    <SendHorizontal strokeWidth={1.5} />
                                {:else if discountState == ButtonState.Updating}
                                    <LoaderCircle class="animate-spin"></LoaderCircle>
                                {:else if discountState == ButtonState.Success}
                                    <Check />
                                {:else if discountState == ButtonState.Fail}
                                    <X />
                                {/if}
                            </StateButton>
                        </div>
                    </form>
                {:else}
                    <div class="flex flex-row justify-between">
                        <div class="flex flex-row items-center gap-6">
                            <Tag size={32} strokeWidth={1.5} />
                            <div>
                                <p class="font-bold">Code promotionnel : {discount.code}</p>
                                {#if discount.type == "fixed"}
                                    <p>-{(discount.amount / 100).toFixed(2)}€</p>
                                {:else if discount.type == "percentage"}
                                    <p>-{discount.amount}%</p>
                                {:else if discount.type == "free_shipping"}
                                    <p>Livraison gratuite</p>
                                {/if}
                            </div>
                        </div>
                        <Button
                            class="h-7 bg-transparent stroke-black py-1 font-normal text-black ring-[1.5px] ring-black transition-all duration-75 hover:bg-transparent hover:stroke-red-600 hover:ring-red-600"
                            onclick={() => deleteCartDiscount()}
                        >
                            <div class="h-5 w-4 fill-none text-transparent">{@html trash}</div>
                        </Button>
                    </div>
                {/if}
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
