<script lang="ts">
    import { Check, ChevronRight, LoaderCircle, X } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import { type Infer, superForm, type SuperValidated } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    import { PUBLIC_DEFAULT_SHIPPING_ID } from "$env/static/public";
    import { shippingFormSchema, type ShippingFormSchema } from "$lib/checkout/formSchema";
    import SubmitFormButton from "$lib/checkout/SubmitFormButton.svelte";
    import { ButtonState } from "$lib/components/StateButton/stateButton";
    import * as Form from "$lib/components/ui/form/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Select from "$lib/components/ui/select";
    import type { ShippingOption } from "$lib/medusa/shipping";
    import { fly } from "svelte/transition";

    const {
        data = $bindable(),
        options,
    }: { data: SuperValidated<Infer<ShippingFormSchema>>; options: ShippingOption[] } = $props();

    let submitState = $state(ButtonState.Idle);

    const form = superForm(data, {
        validators: zodClient(shippingFormSchema),
        onSubmit() {
            submitState = ButtonState.Updating;
        },
        onUpdated({ form }) {
            if (!form.valid) {
                submitState = ButtonState.Fail;
                setTimeout(() => (submitState = ButtonState.Idle), 2500);
            }
        },
        onError({ result }) {
            const message = result.error.message || "Erreur inconnue";
            toast.error("Une erreur est survenue", {
                description: "Code erreur : " + message,
            });

            submitState = ButtonState.Fail;
            setTimeout(() => (submitState = ButtonState.Idle), 2500);
        },
        onResult({ result }) {
            // result.type always be "success" but we handle error if needed
            if (result.type === "error") {
                submitState = ButtonState.Fail;
                setTimeout(() => (submitState = ButtonState.Idle), 2500);
                toast.error("Une erreur est survenue");
            }
        },
    });
    const { form: formData, enhance } = form;

    let selected = $derived.by(() => {
        const option = options.find((option) => option.id === $formData.method);
        if (!option) return undefined;

        return { value: option.id, label: option.name };
    });
</script>

<form id="shipping" method="POST" action="?/shipping" class="p-2" use:enhance>
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
            <Form.Field {form} name="address" class="mb-4 mt-4">
                <Form.Control>
                    {#snippet children({ attrs }: { attrs: object })}
                        <Form.Label>Adresse</Form.Label>
                        <Input {...attrs} bind:value={$formData.address} placeholder="123 rue exemple" />
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>

            <Form.Field {form} name="complement" class="mb-4">
                <Form.Control>
                    {#snippet children({ attrs }: { attrs: object })}
                        <Form.Label>Complément (Optionel)</Form.Label>
                        <Input {...attrs} bind:value={$formData.complement} placeholder="Appartement A123" />
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>

            <div class="space-y-4 sm:grid sm:grid-cols-[70%_auto] sm:gap-x-2 sm:space-y-0">
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

            <!-- <Form.Field {form} name="country">
                <Form.Control>
                    {#snippet children({ attrs }: { attrs: object })}
                        <Form.Label>Pays</Form.Label>
                        <Input {...attrs} bind:value={$formData.country} placeholder="France" />
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field> -->
        </div>
    {/if}

    <div class="mt-4 w-16 justify-self-end">
        <SubmitFormButton buttonState={submitState}>
            {#if submitState == ButtonState.Idle}
                <ChevronRight strokeWidth={1.5} />
            {:else if submitState == ButtonState.Updating}
                <LoaderCircle class="animate-spin"></LoaderCircle>
            {:else if submitState == ButtonState.Success}
                <Check />
            {:else if submitState == ButtonState.Fail}
                <X />
            {/if}
        </SubmitFormButton>
    </div>
</form>
