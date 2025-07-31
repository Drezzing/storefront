<script lang="ts">
    import Check from "@lucide/svelte/icons/check";
    import ChevronRight from "@lucide/svelte/icons/chevron-right";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import X from "@lucide/svelte/icons/x";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { fly } from "svelte/transition";
    import { superForm, type SuperValidated } from "sveltekit-superforms";

    import { ButtonStateEnum, StateButton } from "$lib/components/StateButton";
    import * as Form from "$lib/components/ui/form/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Select from "$lib/components/ui/select";
    import env from "$lib/env/public";
    import type { ShippingOption } from "$lib/medusa/shipping";
    import { zod4MiniClient } from "$lib/schemas/adapters";
    import { shippingFormSchema, type ShippingFormType } from "$lib/schemas/checkout";
    import { cn } from "$lib/utils";

    const { data = $bindable(), options }: { data: SuperValidated<ShippingFormType>; options: ShippingOption[] } =
        $props();

    let submitState = $state(ButtonStateEnum.Idle);

    const form = superForm(data, {
        validators: zod4MiniClient(shippingFormSchema),
        resetForm: false,
        invalidateAll: false,
        onSubmit() {
            submitState = ButtonStateEnum.Updating;
        },
        onUpdated({ form }) {
            if (!form.valid) {
                submitState = ButtonStateEnum.Fail;
                setTimeout(() => (submitState = ButtonStateEnum.Idle), 2500);
            }
        },
        onError({ result }) {
            const message = result.error.message || "Erreur inconnue";
            toast.error("Une erreur est survenue", {
                description: "Code erreur : " + message,
            });

            submitState = ButtonStateEnum.Fail;
            setTimeout(() => (submitState = ButtonStateEnum.Idle), 2500);
        },
        onResult() {
            submitState = ButtonStateEnum.Idle;
        },
    });
    const { form: formData, enhance } = form;
    const shippingFormOpen = $derived($formData.method !== env.get("PUBLIC_MEDUSA_DEFAULT_SHIPPING_ID"));

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
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Mode de livraison</Form.Label>
                <Select.Root type="single" bind:value={$formData.method} name={props.name}>
                    <Select.Trigger {...props}>
                        {$formData.method
                            ? options.find((option) => option.id === $formData.method)?.name
                            : "Mode de livraison"}
                    </Select.Trigger>
                    <Select.Content>
                        {#each options as option (option.id)}
                            <Select.Item value={option.id} label={option.name} />
                        {/each}
                    </Select.Content>
                </Select.Root>
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    {#if shippingFormOpen}
        <div transition:fly={{ duration: 250 }}>
            <Form.Field {form} name="address" class="mt-4 mb-4">
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label>Adresse</Form.Label>
                        <Input {...props} bind:value={$formData.address} placeholder="123 rue exemple" />
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>

            <Form.Field {form} name="complement" class="mb-4">
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label>Complément (Optionel)</Form.Label>
                        <Input {...props} bind:value={$formData.complement} placeholder="Appartement A123" />
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>

            <div class="space-y-4 sm:grid sm:grid-cols-[70%_auto] sm:space-y-0 sm:gap-x-2">
                <Form.Field {form} name="city">
                    <Form.Control>
                        {#snippet children({ props })}
                            <Form.Label>Ville</Form.Label>
                            <Input {...props} bind:value={$formData.city} placeholder="Paris" />
                        {/snippet}
                    </Form.Control>
                    <Form.FieldErrors />
                </Form.Field>

                <Form.Field {form} name="postal_code">
                    <Form.Control>
                        {#snippet children({ props })}
                            <Form.Label>Code postal</Form.Label>
                            <Input {...props} bind:value={$formData.postal_code} placeholder="75000" />
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
        <StateButton state={submitState} type="formSubmit">
            {#snippet idle()}
                <ChevronRight strokeWidth={1.5} />
            {/snippet}

            {#snippet updating()}
                <LoaderCircle class="animate-spin"></LoaderCircle>
            {/snippet}

            {#snippet success()}
                <Check />
            {/snippet}

            {#snippet fail()}
                <X />
            {/snippet}
        </StateButton>
    </div>
</form>
