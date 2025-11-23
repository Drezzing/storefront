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
    import type { MondialRelayPointRelay } from "$lib/mondial-relay/types.js";
    import { shippingMondialRelayParcelSchema, type ShippingMondialRelayParcelSchema } from "$lib/schemas/checkout";
    import ParcelSelector from "./ParcelSelector/ParcelSelector.svelte";

    let selectedParcel = $state<MondialRelayPointRelay | null>(null);
    let submitState = $state(ButtonStateEnum.Idle);

    let { data, method }: { data: SuperValidated<Infer<ShippingMondialRelayParcelSchema>>; method: string } = $props();

    const form = superForm(data, {
        validators: zod4Client(shippingMondialRelayParcelSchema),
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
    $formData.fulfillment_id = "mondial-relay-point-relais";
</script>

<form id={data.id} method="POST" action="?/shipping" class="flex flex-col" use:enhance>
    <Form.Field {form} hidden name="method" class="mb-4">
        <Form.Control>
            {#snippet children({ props })}
                <Input {...props} bind:value={$formData.method} />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} hidden name="fulfillment_id" class="mb-4">
        <Form.Control>
            {#snippet children({ props })}
                <Input {...props} bind:value={$formData.fulfillment_id} />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="parcel_id" class="my-4">
        <Form.Control>
            {#snippet children({ props })}
                <Input {...props} hidden bind:value={() => selectedParcel?.Num || "", () => {}} />
                <ParcelSelector bind:selectedParcel></ParcelSelector>
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
