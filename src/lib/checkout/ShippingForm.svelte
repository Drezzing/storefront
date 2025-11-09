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
    }: { forms: Exclude<CheckoutData["shipping"], null>["forms"]; options: ShippingOption[] } = $props();

    let method = $state<string>();
    const selectedOption = $derived(options.find((option) => option.id === method));
</script>

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
            <ParcelShipping data={forms.parcelShippingMethodForm} method={selectedOption.id} />
        {:else if selectedOption?.fulfillment_id === "mondial-relay-home"}
            <HomeShipping data={forms.homeShippingMethodForm} method={selectedOption.id} />
        {:else}
            <p>Something went wrong</p>
        {/if}
    {/if}
</div>
