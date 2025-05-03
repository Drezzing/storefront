<script lang="ts">
    import Check from "@lucide/svelte/icons/check";
    import ChevronRight from "@lucide/svelte/icons/chevron-right";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import X from "@lucide/svelte/icons/x";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { type Infer, superForm, type SuperValidated } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    import { userInfoFormSchema, type UserInfoFormSchema } from "$lib/checkout/formSchema";
    import SubmitFormButton from "$lib/checkout/SubmitFormButton.svelte";
    import { ButtonState } from "$lib/components/StateButton/stateButton";
    import * as Form from "$lib/components/ui/form/index.js";
    import { Input } from "$lib/components/ui/input/index.js";

    const { data = $bindable() }: { data: SuperValidated<Infer<UserInfoFormSchema>> } = $props();

    let submitState = $state(ButtonState.Idle);

    const form = superForm(data, {
        validators: zodClient(userInfoFormSchema),
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
    onMount(() => {
        const input: HTMLInputElement | null = document.querySelector("input[name='firstName']");
        if (input) {
            input.focus();
        }
    });
</script>

<form
    id="info"
    method="POST"
    action="?/userInfo"
    class="grid grid-cols-1 grid-rows-[repeat(4,auto)] gap-x-2 gap-y-4 p-2 md:grid-cols-2 md:grid-rows-[repeat(3,auto)]"
    use:enhance
>
    <Form.Field {form} name="firstName">
        <Form.Control>
            {#snippet children({ attrs }: { attrs: object })}
                <Form.Label>Prénom</Form.Label>
                <Input {...attrs} bind:value={$formData.firstName} />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="lastName">
        <Form.Control>
            {#snippet children({ attrs }: { attrs: object })}
                <Form.Label>Nom</Form.Label>
                <Input {...attrs} bind:value={$formData.lastName} />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="mail" class="md:col-span-2">
        <Form.Control>
            {#snippet children({ attrs }: { attrs: object })}
                <Form.Label>Adresse mail</Form.Label>
                <Input {...attrs} bind:value={$formData.mail} />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <div class="w-16 justify-self-end md:col-span-2">
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
