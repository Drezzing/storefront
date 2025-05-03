<script lang="ts">
    let { total = $bindable(), discount = $bindable() }: { total: number; discount: DiscountType | null } = $props();

    import Check from "@lucide/svelte/icons/check";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import SendHorizontal from "@lucide/svelte/icons/send-horizontal";
    import Tag from "@lucide/svelte/icons/tag";
    import X from "@lucide/svelte/icons/x";

    import CartDeleteButton from "$lib/cart/CartDeleteButton.svelte";
    import StateButton from "$lib/components/StateButton/StateButton.svelte";
    import { ButtonState } from "$lib/components/StateButton/stateButton";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { clientRequest, displayClientError } from "$lib/error.js";
    import type { DiscountType } from "$lib/medusa/discount.js";

    let discountState = $state(ButtonState.Idle);
    let discountCode = $state("");

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
            displayClientError(response);
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

        const response = await clientRequest<{ total: number }>("CART_CART_DELETE", "/api/discount", {
            method: "DELETE",
            body: JSON.stringify({ discount_code: discount.code }),
        });

        if (!response.success) {
            displayClientError(response);
        } else {
            total = response.data.total;
            discount = null;
            discountState = ButtonState.Idle;
            discountCode = "";
        }
    };
</script>

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
        <CartDeleteButton onclick={deleteCartDiscount} />
    </div>
{/if}
