<script lang="ts">
    import Check from "@lucide/svelte/icons/check";
    import ChevronRight from "@lucide/svelte/icons/chevron-right";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import X from "@lucide/svelte/icons/x";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { fly } from "svelte/transition";
    import { type Infer, superForm, type SuperValidated } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    import { shippingFormSchema, type ShippingFormSchema } from "$lib/checkout/formSchema";
    import SubmitFormButton from "$lib/checkout/SubmitFormButton.svelte";
    import { ButtonState } from "$lib/components/StateButton/stateButton";
    import * as Form from "$lib/components/ui/form/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Select from "$lib/components/ui/select";
    import env from "$lib/env/public";
    import type { ShippingOption } from "$lib/medusa/shipping";
    import { cn } from "$lib/utils";

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

    const shippingFormOpen = $derived(selected && selected.value !== env.get("PUBLIC_MEDUSA_DEFAULT_SHIPPING_ID"));

    onMount(() => {
        const select: HTMLButtonElement | null = document.querySelector("form[id='shipping'] > * > button");
        if (select) {
            select.focus();
        }
    });
</script>

<form
    id="shipping"
    method="POST"
    action="?/shipping"
    class={cn("grid grid-rows-3 p-2", shippingFormOpen ? "grid-rows-[auto_auto_auto]" : "grid-rows-[auto_auto]")}
    use:enhance
>
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
                    {#each options as option (option.id)}
                        <Select.Item value={option.id} label={option.name} />
                    {/each}
                </Select.Content>
            </Select.Root>
            <input hidden bind:value={$formData.method} name={attrs.name} />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    {#if shippingFormOpen}
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
