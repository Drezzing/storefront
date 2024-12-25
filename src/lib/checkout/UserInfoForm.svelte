<script lang="ts">
    import { type Infer, superForm, type SuperValidated } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { ChevronRight } from "lucide-svelte";

    import { userInfoFormSchema, type UserInfoFormSchema } from "$lib/checkout/formSchema";
    import * as Form from "$lib/components/ui/form/index.js";
    import { Input } from "$lib/components/ui/input/index.js";

    const { data = $bindable() }: { data: SuperValidated<Infer<UserInfoFormSchema>> } = $props();

    const form = superForm(data, {
        validators: zodClient(userInfoFormSchema),
    });

    const { form: formData, enhance } = form;
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
    <div class="text-right md:col-span-2">
        <Form.Button><ChevronRight /></Form.Button>
    </div>
</form>
