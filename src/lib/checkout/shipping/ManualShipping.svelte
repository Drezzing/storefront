<script lang="ts">
    import Check from "@lucide/svelte/icons/check";
    import ChevronRight from "@lucide/svelte/icons/chevron-right";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import X from "@lucide/svelte/icons/x";
    import { toast } from "svelte-sonner";
    import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
    import { zod4Client } from "sveltekit-superforms/adapters";

    import { ButtonStateEnum, StateButton } from "$lib/components/StateButton";
    import * as Form from "$lib/components/ui/form/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { shippingManualSchema, type ShippingManualFormSchema } from "$lib/schemas/checkout";

    let submitState = $state(ButtonStateEnum.Idle);

    let { data, method }: { data: SuperValidated<Infer<ShippingManualFormSchema>>; method: string } = $props();

    const form = superForm(data, {
        validators: zod4Client(shippingManualSchema),
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

    $formData.method = method;
    $formData.fulfillment_id = "manual-fulfillment";
</script>

<form id={data.id} method="POST" action="?/shipping" class="flex w-full flex-col" use:enhance>
    <Form.Field {form} hidden name="method">
        <Form.Control>
            {#snippet children({ props })}
                <Input {...props} bind:value={$formData.method} />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} hidden name="fulfillment_id">
        <Form.Control>
            {#snippet children({ props })}
                <Input {...props} bind:value={$formData.fulfillment_id} />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <div class="mt-4 w-16 self-end">
        <StateButton state={submitState} type="formSubmit">
            {#snippet idle()}
                <ChevronRight strokeWidth={1.5} />
            {/snippet}

            {#snippet updating()}
                <LoaderCircle class="animate-spin" />
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
