<script lang="ts">
    import Label from "$lib/components/ui/label/label.svelte";
    import * as Select from "$lib/components/ui/select";
    import type { CheckoutData } from "$lib/medusa/checkout";
    import type { ShippingOption } from "$lib/medusa/shipping";
    import HomeShipping from "./shipping/HomeShipping.svelte";
    import ManualShipping from "./shipping/ManualShipping.svelte";
    import ParcelShipping from "./shipping/ParcelShipping.svelte";

    const {
        forms = $bindable(),
        options,
        shippableProducts,
    }: {
        forms: Exclude<CheckoutData["shipping"], null>["forms"];
        options: ShippingOption[];
        shippableProducts: Record<string, boolean>;
    } = $props();

    let method = $state<string>();
    const selectedOption = $derived(options.find((option) => option.id === method));
    const hasUnshippable = $derived(Object.values(shippableProducts).some((shippable) => !shippable));
</script>

{#snippet warnUnshippable()}
    {#if hasUnshippable}
        <div class="mt-4 rounded bg-[#ffedcc] px-4 py-2 outline-2 outline-[#f0b37e]">
            <p>Les produits suivants ne sont pas disponibles à la livraison :</p>
            <ul>
                {#each Object.entries(shippableProducts) as [product, shippable] (product)}
                    {#if !shippable}
                        <li>- {product}</li>
                    {/if}
                {/each}
            </ul>
        </div>
    {/if}
{/snippet}

<div class="space-y-2 px-2">
    <Label for="method">Mode de livraison</Label>
    <Select.Root type="single" bind:value={method}>
        <Select.Trigger class="w-full" id="method">
            {selectedOption ? selectedOption.name : "Mode de livraison"}
        </Select.Trigger>
        <Select.Content>
            {#each options as option (option.id)}
                <Select.Item value={option.id} label={option.name} />
            {/each}
        </Select.Content>
    </Select.Root>
    {#if selectedOption}
        {#if selectedOption.fulfillment_id === "manual-fulfillment"}
            <ManualShipping data={forms.manualMethodForm} method={selectedOption.id} />
        {:else if selectedOption?.fulfillment_id === "mondial-relay-point-relais"}
            {@render warnUnshippable()}
            <ParcelShipping data={forms.parcelShippingMethodForm} method={selectedOption.id} />
        {:else if selectedOption?.fulfillment_id === "mondial-relay-home"}
            {@render warnUnshippable()}
            <HomeShipping data={forms.homeShippingMethodForm} method={selectedOption.id} />
        {:else}
            <p>Something went wrong</p>
        {/if}
    {/if}
</div>
