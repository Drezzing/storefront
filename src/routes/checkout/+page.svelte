<script lang="ts">
    import { loadStripe, type StripeElements } from "@stripe/stripe-js";
    import { untrack } from "svelte";
    import type { Infer, SuperValidated } from "sveltekit-superforms";

    import { PUBLIC_STRIPE_API_KEY } from "$env/static/public";
    import CartStripe from "$lib/cart/CartStripe.svelte";
    import type { ShippingFormSchema, UserInfoFormSchema } from "$lib/checkout/formSchema";
    import ShippingForm from "$lib/checkout/ShippingForm.svelte";
    import UserInfoForm from "$lib/checkout/UserInfoForm.svelte";
    import * as Accordion from "$lib/components/ui/accordion";
    import { Separator } from "$lib/components/ui/separator/index";
    import type { PriceDetails } from "$lib/medusa/checkout.js";

    let { data, form } = $props();
    const checkoutData = $state(data);
    // let { cart, userInfoForm, shippingForm, shippingOptions, priceDetails } = $state(data);

    let value = $state("0");
    let currentState = $state(0);

    const stripe = loadStripe(PUBLIC_STRIPE_API_KEY);
    let client_secret: string = $state("");

    $effect(() => {
        if (!form || !form.success || !checkoutData.cart) return;

        untrack(() => (value = String(Number(value) + 1)));
        untrack(() => currentState++);

        if (form.form.id === "info") {
            checkoutData.userInfoForm = form.form as SuperValidated<Infer<UserInfoFormSchema>>;
        } else if (form.form.id === "shipping") {
            checkoutData.shippingForm = form.form as SuperValidated<Infer<ShippingFormSchema>>;
            checkoutData.priceDetails = form.priceDetails as PriceDetails;
        }
    });
</script>

<svelte:head>
    <title>Commander</title>
    <meta name="description" content="Passer votre commande" />
</svelte:head>

<div class="px-4 sm:px-6 md:mx-auto md:max-w-[1350px] md:px-8">
    <h1 class="text-2xl font-bold">Commander</h1>

    <Separator class="my-4" />
    {#if checkoutData.cart}
        <div class="flex flex-col items-start justify-center gap-4 md:flex-row lg:gap-8">
            <div class="w-full grow space-y-4 md:w-auto">
                <Accordion.Root bind:value>
                    <Accordion.Item value="0">
                        <Accordion.Trigger>Informations</Accordion.Trigger>
                        <Accordion.Content>
                            <UserInfoForm bind:data={checkoutData.userInfoForm} />
                        </Accordion.Content>
                    </Accordion.Item>

                    <Accordion.Item value="1" disabled={currentState < 1} class="group">
                        <Accordion.Trigger
                            class="group-data-[disabled]:text-black/50 group-data-[disabled]:no-underline"
                            >Livraison</Accordion.Trigger
                        >
                        <Accordion.Content>
                            <ShippingForm
                                bind:data={checkoutData.shippingForm}
                                options={checkoutData.shippingOptions}
                            />
                        </Accordion.Content>
                    </Accordion.Item>

                    <Accordion.Item value="2" disabled={currentState < 2} class="group">
                        <Accordion.Trigger
                            class="group-data-[disabled]:text-black/50 group-data-[disabled]:no-underline"
                            >Paiement</Accordion.Trigger
                        >
                        <Accordion.Content>
                            <CartStripe {stripe} userData={checkoutData.userInfoForm.data} bind:client_secret />
                        </Accordion.Content>
                    </Accordion.Item>
                </Accordion.Root>
            </div>

            <div class="w-full rounded md:sticky md:top-4 md:w-[min(24rem,40vw)] lg:w-96">
                <h2 class="text-xl font-semibold">Votre commande</h2>
                <div class="grid grid-cols-2">
                    <p class="mt-2 text-black/75">Commande</p>
                    <p class="mt-2 justify-self-end text-black/75">
                        {(checkoutData.priceDetails.order / 100).toFixed(2)}€
                    </p>
                    <p class="mb-2 text-black/75">Livraison</p>
                    {#if checkoutData.priceDetails.shipping}
                        <p class="mb-2 justify-self-end text-black/75">
                            {(checkoutData.priceDetails.shipping / 100).toFixed(2)}€
                        </p>
                    {:else}
                        <p class="mb-2 justify-self-end text-black/75">Gratuite</p>
                    {/if}

                    {#if checkoutData.priceDetails.discount}
                        <p class="mb-2 text-black/75">Réduction</p>
                        <p class="mb-2 justify-self-end text-black/75">
                            -{(checkoutData.priceDetails.discount / 100).toFixed(2)}€
                        </p>
                    {/if}
                    <p>Total (TTC)</p>
                    <p class="justify-self-end">{(checkoutData.priceDetails.total / 100).toFixed(2)}€</p>
                </div>
            </div>
        </div>
    {:else}
        <p class="mt-16 text-center font-bold">Votre panier est vide.</p>
    {/if}
</div>
