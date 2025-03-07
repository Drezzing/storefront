<script lang="ts">
    import { ChevronRight } from "lucide-svelte";
    import { type Infer, superForm, type SuperValidated } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    import { PUBLIC_DEFAULT_SHIPPING_ID } from "$env/static/public";
    import { shippingFormSchema, type ShippingFormSchema } from "$lib/checkout/formSchema";
    import * as Form from "$lib/components/ui/form/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Select from "$lib/components/ui/select";
    import type { ShippingOption } from "$lib/medusa/shipping";
    import { fly } from "svelte/transition";

    const {
        data = $bindable(),
        options,
    }: { data: SuperValidated<Infer<ShippingFormSchema>>; options: ShippingOption[] } = $props();

    const form = superForm(data, {
        validators: zodClient(shippingFormSchema),
    });
    const { form: formData, enhance } = form;

    let selected = $derived.by(() => {
        const option = options.find((option) => option.id === $formData.method);
        if (!option) return undefined;

        return { value: option.id, label: option.name };
    });

    $inspect($formData);
</script>

<form id="shipping" method="POST" action="?/shipping" class="p-2" use:enhance onsubmit={() => console.log("test")}>
    <Form.Field {form} name="method">
        <Form.Control let:attrs>
            <Form.Label>Mode de livraison</Form.Label>
            <Select.Root
                {selected}
                onSelectedChange={(v) => {
                    if (v) {
                        $formData.method = v.value;
                    }
                }}
            >
                <Select.Trigger {...attrs}>
                    <Select.Value placeholder="Mode de livraison" />
                </Select.Trigger>
                <Select.Content>
                    {#each options as option}
                        <Select.Item value={option.id} label={option.name} />
                    {/each}
                </Select.Content>
            </Select.Root>
            <input hidden bind:value={$formData.method} name={attrs.name} />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    {#if selected && selected.value !== PUBLIC_DEFAULT_SHIPPING_ID}
        <div transition:fly={{ duration: 250 }}>
            <Form.Field {form} name="address">
                <Form.Control>
                    {#snippet children({ attrs }: { attrs: object })}
                        <Form.Label>Adresse</Form.Label>
                        <Input {...attrs} bind:value={$formData.address} placeholder="123 rue exemple" />
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>

            <Form.Field {form} name="complement">
                <Form.Control>
                    {#snippet children({ attrs }: { attrs: object })}
                        <Form.Label>Complément (Optionel)</Form.Label>
                        <Input {...attrs} bind:value={$formData.complement} placeholder="Appartement A123" />
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>

            <div class="sm:grid sm:grid-cols-[70%_auto] sm:gap-x-2">
                <Form.Field {form} name="city">
                    <Form.Control>
                        {#snippet children({ attrs }: { attrs: object })}
                            <Form.Label>Ville</Form.Label>
                            <Input {...attrs} bind:value={$formData.city} placeholder="Paris" />
                        {/snippet}
                    </Form.Control>
                    <Form.FieldErrors />
                </Form.Field>

                <Form.Field {form} name="postal_code">
                    <Form.Control>
                        {#snippet children({ attrs }: { attrs: object })}
                            <Form.Label>Code postal</Form.Label>
                            <Input {...attrs} bind:value={$formData.postal_code} placeholder="75000" />
                        {/snippet}
                    </Form.Control>
                    <Form.FieldErrors />
                </Form.Field>
            </div>

            <Form.Field {form} name="country">
                <Form.Control>
                    {#snippet children({ attrs }: { attrs: object })}
                        <Form.Label>Pays</Form.Label>
                        <Input {...attrs} bind:value={$formData.country} placeholder="France" />
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>
        </div>
    {/if}

    <div class="text-right md:col-span-2">
        <Form.Button><ChevronRight /></Form.Button>
    </div>
</form>
