<script lang="ts">
    import Check from "@lucide/svelte/icons/check";
    import ChevronRight from "@lucide/svelte/icons/chevron-right";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import X from "@lucide/svelte/icons/x";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { superForm, type SuperValidated } from "sveltekit-superforms";

    import { ButtonStateEnum, StateButton } from "$lib/components/StateButton";
    import * as Form from "$lib/components/ui/form/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { zod4MiniClient } from "$lib/schemas/adapters";
    import { userInfoFormSchema, type UserInfoFormType } from "$lib/schemas/checkout";

    const { data = $bindable() }: { data: SuperValidated<UserInfoFormType> } = $props();

    let submitState = $state(ButtonStateEnum.Idle);

    const form = superForm(data, {
        validators: zod4MiniClient(userInfoFormSchema),
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
        onResult({ result }) {
            // result.type always be "success" but we handle error if needed
            if (result.type === "error") {
                submitState = ButtonStateEnum.Fail;
                setTimeout(() => (submitState = ButtonStateEnum.Idle), 2500);
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
            {#snippet children({ props })}
                <Form.Label>Prénom</Form.Label>
                <Input bind:value={$formData.firstName} {...props} />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="lastName">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Nom</Form.Label>
                <Input {...props} bind:value={$formData.lastName} />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="mail" class="md:col-span-2">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Adresse mail</Form.Label>
                <Input {...props} bind:value={$formData.mail} />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <div class="w-16 justify-self-end md:col-span-2">
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
