<script lang="ts">
    import Check from "@lucide/svelte/icons/check";
    import ChevronRight from "@lucide/svelte/icons/chevron-right";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import X from "@lucide/svelte/icons/x";
    import { toast } from "svelte-sonner";
    import { TelInput, normalizedCountries } from "svelte-tel-input";
    import { type CountryCode, type DetailedValue } from "svelte-tel-input/types";
    import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
    import { zod4Client } from "sveltekit-superforms/adapters";

    import { ButtonStateEnum, StateButton } from "$lib/components/StateButton";
    import * as Form from "$lib/components/ui/form/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label";
    import * as Select from "$lib/components/ui/select";
    import { shippingMondialRelayHomeSchema, type ShippingMondialRelayHomeSchema } from "$lib/schemas/checkout";
    import { cn } from "$lib/utils";

    let submitState = $state(ButtonStateEnum.Idle);

    let { data, method }: { data: SuperValidated<Infer<ShippingMondialRelayHomeSchema>>; method: string } = $props();

    const form = superForm(data, {
        validators: zod4Client(shippingMondialRelayHomeSchema),
        dataType: "json",
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
    $formData.fulfillment_id = "mondial-relay-home";

    let selectedCountry = $state<CountryCode>("FR");
    let detailedValue: DetailedValue | null = $state(null);

    const availableCountries = normalizedCountries.filter(
        (c) =>
            c.dialCode === "33" ||
            c.dialCode === "262" ||
            c.dialCode === "590" ||
            c.dialCode === "596" ||
            c.dialCode === "594",
    );
    availableCountries.forEach((country) => {
        const currentName = country.name;
        const splits = currentName.split("(");

        // extract french name and replace default name with it
        if (splits.length >= 2) {
            country.name = splits[1].replaceAll(")", "").trim();
            country.label = `${country.name} +${country.dialCode}`;
        }
    });
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

    <div class="mb-4 space-y-4 sm:grid sm:grid-cols-[70%_auto] sm:space-y-0 sm:gap-x-2">
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

    <div class="grid grid-cols-[max(15%,100px)_auto] space-y-0 gap-x-2">
        <div class="space-y-2">
            <Label for="country-code">Code pays</Label>
            <Select.Root type="single" bind:value={selectedCountry}>
                <Select.Trigger class="w-full" id="country-code">
                    {@const country = availableCountries.find((c) => c.iso2 === selectedCountry)}
                    {#if country}
                        <span>+ {country.dialCode}</span>
                    {:else}
                        <span>Sélectionner un pays</span>
                    {/if}
                </Select.Trigger>
                <Select.Content>
                    {#each availableCountries as country (country.id)}
                        <Select.Item value={country.iso2} class="flex justify-between gap-12 pr-10">
                            <span>{country.name.split("(")[0]}</span>
                            <span>+{country.dialCode}</span>
                        </Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>
        </div>
        <div>
            <Form.Field {form} name="phone">
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label>Téléphone</Form.Label>
                        <TelInput
                            {...props}
                            class={cn(
                                "border-input bg-background selection:bg-primary dark:bg-input/30 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                            )}
                            id="phone"
                            bind:value={$formData.phone}
                            bind:detailedValue
                            bind:country={selectedCountry}
                        />
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors class="mb-2" />
            </Form.Field>
        </div>
        <p class="text-muted-foreground col-span-2 text-justify text-sm italic">
            Seulement les formats de numéros de téléphones listés sont compatibles avec notre fournisseur. Si vous ne
            possèdez pas de numéro compatible, veuillez opter pour la livraison en point-relais ou la remise en main
            propre.
        </p>
    </div>

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
