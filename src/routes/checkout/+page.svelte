<script lang="ts">
    import { untrack } from "svelte";

    import ShippingForm from "$lib/checkout/ShippingForm.svelte";
    import StripeForm from "$lib/checkout/StripeForm.svelte";
    import UserInfoForm from "$lib/checkout/UserInfoForm.svelte";
    import * as Accordion from "$lib/components/ui/accordion";
    import { Separator } from "$lib/components/ui/separator/index";
    import type { ShippingMondialRelayHomeType, UserInfoFormType } from "$lib/schemas/checkout.js";

    let { data, form } = $props();
    const checkoutData = $state(data);

    let value = $state("0");
    let currentState = $state(0);

    let userInfo = $state<UserInfoFormType>();
    let userShippingAddress = $state<ShippingMondialRelayHomeType>();

    $effect(() => {
        if (!form || !form.success || !checkoutData.cart) return;

        untrack(() => (value = String(Number(value) + 1)));

        if (form.userInfoForm) {
            userInfo = form.userInfoForm.data;
            untrack(() => (currentState = Math.max(currentState, 1)));
        } else if (form.shippingForm.valid && form.priceDetails) {
            if (form.shippingForm.data.fulfillment_id === "mondial-relay-home") {
                userShippingAddress = form.shippingForm.data;
            }
            checkoutData.priceDetails = form.priceDetails;
            untrack(() => (currentState = Math.max(currentState, 2)));
        }
    });
</script>

<svelte:head>
    <title>Commander</title>
    <meta property="og:title" content="Commander" />
    <meta name="description" content="Finalisez votre commande." />
    <meta property="og:description" content="Finalisez votre commande." />

    <meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="px-4 sm:px-6 lg:mx-auto lg:max-w-[1350px] lg:px-8">
    <h1 class="text-2xl font-bold">Commander</h1>

    <Separator class="my-4" />
    {#if checkoutData.cart}
        <div
            class="flex flex-col items-start justify-center gap-4 lg:grid lg:grid-cols-[1fr_auto] lg:flex-row lg:gap-8"
        >
            <div class="w-full grow space-y-4 lg:w-auto">
                <Accordion.Root type="single" bind:value>
                    <Accordion.Item value="0">
                        <Accordion.Trigger>Informations</Accordion.Trigger>
                        <Accordion.Content>
                            <UserInfoForm data={checkoutData.userInfoForm} />
                        </Accordion.Content>
                    </Accordion.Item>

                    <Accordion.Item value="1" disabled={currentState < 1} class="group">
                        <Accordion.Trigger
                            class="group-data-[disabled]:text-black/50 group-data-[disabled]:no-underline"
                            >Livraison</Accordion.Trigger
                        >
                        <Accordion.Content>
                            <ShippingForm
                                forms={checkoutData.shipping.forms}
                                options={checkoutData.shipping.shippingOptions}
                                shippableProducts={checkoutData.shipping.shippableProducts}
                            />
                        </Accordion.Content>
                    </Accordion.Item>

                    <Accordion.Item value="2" disabled={currentState < 2} class="group">
                        <Accordion.Trigger
                            class="group-data-[disabled]:text-black/50 group-data-[disabled]:no-underline"
                            >Paiement</Accordion.Trigger
                        >
                        <Accordion.Content>
                            <StripeForm userInfo={userInfo!} {userShippingAddress} />
                        </Accordion.Content>
                    </Accordion.Item>
                </Accordion.Root>
            </div>

            <div class="w-full rounded lg:sticky lg:top-[72px] lg:w-80 xl:w-96">
                <h2 class="text-xl font-semibold">Votre commande</h2>
                <div class="grid w-full grid-cols-2">
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
