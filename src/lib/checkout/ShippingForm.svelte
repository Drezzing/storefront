<script lang="ts">
    import { ChevronRight } from "lucide-svelte";
    import SuperDebug, { type Infer, superForm, type SuperValidated } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    import { shippingFormSchema, type ShippingFormSchema } from "$lib/checkout/formSchema";
    import * as Form from "$lib/components/ui/form/index.js";
    import * as Select from "$lib/components/ui/select";
    import type { ShippingOption } from "$lib/medusa/shipping";

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
</script>

<form method="POST" action="?/shipping" use:enhance>
    <Form.Field {form} name="method">
        <Form.Control let:attrs>
            <Form.Label>Prénom</Form.Label>
            <Select.Root
                {selected}
                onSelectedChange={(v) => {
                    v && ($formData.method = v.value);
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

    <div class="text-right md:col-span-2">
        <Form.Button><ChevronRight /></Form.Button>
    </div>
</form>
