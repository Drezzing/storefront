<script lang="ts">
    import Check from "@lucide/svelte/icons/check";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import Send from "@lucide/svelte/icons/send-horizontal";
    import X from "@lucide/svelte/icons/x";
    import { toast } from "svelte-sonner";
    import { superForm } from "sveltekit-superforms";

    import { ButtonStateEnum, StateButton } from "$lib/components/StateButton";
    import * as Form from "$lib/components/ui/form/index.js";
    import { Input } from "$lib/components/ui/input";
    import * as Select from "$lib/components/ui/select";
    import { Textarea } from "$lib/components/ui/textarea";
    import { zod4MiniClient } from "$lib/schemas/adapters";
    import { contactFormSchema, contactSubjects } from "$lib/schemas/contact";

    const { data } = $props();
    const { contactForm } = data;

    let submitState = $state(ButtonStateEnum.Idle);

    const form = superForm(contactForm, {
        validators: zod4MiniClient(contactFormSchema),
        onSubmit() {
            submitState = ButtonStateEnum.Updating;
        },
        onUpdated({ form }) {
            if (!form.valid) {
                submitState = ButtonStateEnum.Fail;
                setTimeout(() => (submitState = ButtonStateEnum.Idle), 2500);
            } else {
                submitState = ButtonStateEnum.Success;
                // @ts-expect-error undefined to force placeholder
                $formData.subject = undefined;
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
    });

    const { form: formData, enhance } = form;

    // @ts-expect-error undefined to force placeholder
    $formData.subject = undefined;
</script>

<svelte:head>
    <title>Contact</title>
    <meta property="og:title" content="Contact" />
    <meta
        name="description"
        content="Contactez-nous pour toute question ou assistance concernant nos services ou produits."
    />
    <meta
        property="og:description"
        content="Contactez-nous pour toute question ou assistance concernant nos services ou produits."
    />
</svelte:head>

<div class="max-w-[1024px] space-y-4 px-4 md:px-8 lg:m-auto">
    <h1 class="text-center text-3xl font-bold">Contact</h1>

    <form id="info" method="POST" class="space-y-4" use:enhance>
        <Form.Field {form} name="email">
            <Form.Control>
                {#snippet children({ props })}
                    <Form.Label>Adresse mail</Form.Label>
                    <Input {...props} bind:value={$formData.email} placeholder="mon.address@domain.ext" />
                {/snippet}
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="subject">
            <Form.Control>
                {#snippet children({ props })}
                    <Form.Label>Objet</Form.Label>
                    <Select.Root type="single" bind:value={$formData.subject} name={props.name}>
                        <Select.Trigger
                            {...props}
                            class="ring-offset-0 focus-visible:ring-2 focus-visible:ring-d-darkgray focus-visible:ring-offset-0 data-[escapee]:ring-2 data-[escapee]:ring-d-darkgray"
                        >
                            {$formData.subject ? $formData.subject : "Mode de livraison"}
                        </Select.Trigger>
                        <Select.Content>
                            {#each contactSubjects as subject (subject)}
                                <Select.Item value={subject} label={subject} />
                            {/each}
                        </Select.Content>
                    </Select.Root>
                {/snippet}
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="content">
            <Form.Control>
                {#snippet children({ props })}
                    <Form.Label>Message</Form.Label>
                    <Textarea
                        {...props}
                        class="ring-offset-0 focus-visible:ring-d-darkgray focus-visible:ring-offset-0"
                        placeholder="Rédigez votre message"
                        bind:value={$formData.content}
                        cols={30}
                        rows={10}
                    />
                {/snippet}
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>

        <div class="flex justify-center">
            <StateButton state={submitState} type="formSubmit">
                {#snippet idle()}
                    <Send class="mr-2" /> Envoyer
                {/snippet}

                {#snippet updating()}
                    <LoaderCircle class="animate-spin"></LoaderCircle>
                {/snippet}

                {#snippet success()}
                    <Check /> Message envoyé
                {/snippet}

                {#snippet fail()}
                    <X />
                {/snippet}
            </StateButton>
        </div>
    </form>
</div>
