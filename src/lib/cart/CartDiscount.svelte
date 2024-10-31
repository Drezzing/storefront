<script lang="ts">
    let { total = $bindable(), discount = $bindable() }: { total: number; discount: DiscountType | null } = $props();

    import { LoaderCircle } from "lucide-svelte";
    import { SendHorizontal } from "lucide-svelte";
    import { Check } from "lucide-svelte";
    import { X } from "lucide-svelte";
    import { Tag } from "lucide-svelte";
    import trash from "$lib/images/trash.svg?raw";

    import { Separator } from "$lib/components/ui/separator/index.js";
    import { clientRequest, displayClientError } from "$lib/error.js";
    import Input from "$lib/components/ui/input/input.svelte";
    import Button from "$lib/components/ui/button/button.svelte";

    import StateButton from "$lib/components/StateButton/StateButton.svelte";
    import { ButtonState } from "$lib/components/StateButton/stateButton";
    import { toast } from "svelte-sonner";
    import type { DiscountType } from "$lib/medusa/discount.js";
    import Label from "$lib/components/ui/label/label.svelte";

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
