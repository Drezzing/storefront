<script lang="ts">
    import { Check, LoaderCircle, Send, X } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    import SubmitFormButton from "$lib/checkout/SubmitFormButton.svelte";
    import { ButtonState } from "$lib/components/StateButton/stateButton";
    import * as Form from "$lib/components/ui/form/index.js";
    import { Input } from "$lib/components/ui/input";
    import * as Select from "$lib/components/ui/select";
    import { Textarea } from "$lib/components/ui/textarea";
    import { contactFormSchema, contactSubjects } from "$lib/contact/schema";

    const { data } = $props();
    const { contactForm } = data;

    let submitState = $state(ButtonState.Idle);
    // dirty workaround to force remount select field to reset it to placeholder
    let forceRemount = $state(true);

    const form = superForm(contactForm, {
        validators: zodClient(contactFormSchema),
        onSubmit() {
            submitState = ButtonState.Updating;
        },
        onUpdated({ form }) {
            if (!form.valid) {
                submitState = ButtonState.Fail;
                setTimeout(() => (submitState = ButtonState.Idle), 2500);
            } else {
                submitState = ButtonState.Success;
                // @ts-expect-error undefined to force placeholder
                $formData.subject = undefined;
                forceRemount = false;
                setTimeout(() => (forceRemount = true), 0);
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
    });

    const { form: formData, enhance } = form;

    // @ts-expect-error undefined to force placeholder
    $formData.subject = undefined;

    let selected = $derived(
        $formData.subject
            ? {
                  value: $formData.subject,
                  label: $formData.subject,
              }
            : undefined,
    );
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
                {#snippet children({ attrs }: { attrs: object })}
                    <Form.Label>Adresse mail</Form.Label>
                    <Input {...attrs} bind:value={$formData.email} placeholder="mon.address@domain.ext" />
                {/snippet}
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>
        {#if forceRemount}
            <Form.Field {form} name="subject">
                <Form.Control let:attrs>
                    <Form.Label>Objet</Form.Label>
                    <Select.Root
                        {selected}
                        onSelectedChange={(v) => {
                            if (v) {
                                $formData.subject = v.value as (typeof contactSubjects)[number];
                            }
                        }}
                    >
                        <Select.Trigger
                            {...attrs}
                            class="ring-offset-0 focus-visible:ring-2 focus-visible:ring-d-darkgray focus-visible:ring-offset-0 data-[escapee]:ring-2 data-[escapee]:ring-d-darkgray"
                        >
                            <Select.Value placeholder="Mode de livraison" />
                        </Select.Trigger>
                        <Select.Content>
                            {#each contactSubjects as subject (subject)}
                                <Select.Item value={subject} label={subject} />
                            {/each}
                        </Select.Content>
                    </Select.Root>
                    <input hidden bind:value={$formData.subject} name={attrs.name} />
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>
        {:else}
            <!-- dummy component to prevent layout shift when remounting -->
            <Form.Field {form} name="subject">
                <Form.Control let:attrs>
                    <Form.Label>Objet</Form.Label>
                    <Select.Root>
                        <Select.Trigger {...attrs} class="data-[escapee]:ring-2 ">
                            <Select.Value placeholder="Mode de livraison" />
                        </Select.Trigger>
                        <Select.Content></Select.Content>
                    </Select.Root>
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>
        {/if}

        <Form.Field {form} name="content">
            <Form.Control>
                {#snippet children({ attrs }: { attrs: object })}
                    <Form.Label>Message</Form.Label>
                    <Textarea
                        {...attrs}
                        bind:value={$formData.content}
                        cols={30}
                        rows={10}
                        placeholder="Rédigez votre message"
                        class="ring-offset-0 focus-visible:ring-d-darkgray focus-visible:ring-offset-0"
                    />
                {/snippet}
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>

        <div class="flex justify-center">
            <SubmitFormButton buttonState={submitState}>
                {#if submitState == ButtonState.Idle}
                    <Send class="mr-2" /> Envoyer
                {:else if submitState == ButtonState.Updating}
                    <LoaderCircle class="animate-spin"></LoaderCircle>
                {:else if submitState == ButtonState.Success}
                    <Check /> Message envoyé
                {:else if submitState == ButtonState.Fail}
                    <X />
                {/if}
            </SubmitFormButton>
        </div>
    </form>
</div>
