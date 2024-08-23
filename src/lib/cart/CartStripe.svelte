<script lang="ts">
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { z } from "zod";

    import { PUBLIC_STRIPE_API_KEY, PUBLIC_BASE_URL } from "$env/static/public";
    import { loadStripe, type Stripe, type StripeElements } from "@stripe/stripe-js";
    import { Elements, PaymentElement, Address } from "svelte-stripe";
    import StateButton from "$lib/components/StateButton/StateButton.svelte";
    import { ButtonState, type StateButtonContent } from "$lib/components/StateButton/stateButton";
    import { onMount } from "svelte";

    let { mail }: { mail: string | null } = $props();

    let stripe: Stripe | null = $state(null);
    onMount(async () => {
        stripe = await loadStripe(PUBLIC_STRIPE_API_KEY);
    });

    let client_secret = $state("");
    let elements: StripeElements | undefined = $state();

    let userMail = $state(mail ?? "");
    let userMailError = $state(false);

    let checkoutStep = $state(0);
    let buttonState = $state(ButtonState.Idle);

    const commonContent = {
        Fail: "Erreur",
        Updating: "Chargement",
        Success: "you should not be seeing this",
    };

    const buyButtonContent: StateButtonContent = { Idle: "Acheter", ...commonContent };
    const stripeButtonContent: StateButtonContent = { Idle: "Valider", ...commonContent };
    const mailButtonContent: StateButtonContent = { Idle: "Suivant", ...commonContent };

    const initCheckout = async () => {
        buttonState = ButtonState.Updating;

        if (userMailError || !userMail) {
            if (!userMail) userMailError = true;
            buttonState = ButtonState.Idle;
            return;
        }

        let req = await fetch("/api/checkout", {
            method: "POST",
            body: JSON.stringify({
                mail: userMail,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        const res = await req.json();

        if (res.success && stripe) {
            client_secret = res.client_secret;
            checkoutStep += 1;
            buttonState = ButtonState.Idle;
        } else {
            buttonState = ButtonState.Fail;
        }
    };

    const submitCheckout = async (e: Event) => {
        e.preventDefault();
        buttonState = ButtonState.Updating;

        if (!stripe || !elements) {
            buttonState = ButtonState.Fail;
            return;
        }

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: PUBLIC_BASE_URL + "/cart/complete",
                receipt_email: userMail,
                payment_method_data: { billing_details: { email: userMail } },
            },
            redirect: "always",
        });

        if (result.error) {
            if (result.error.type !== "validation_error") {
                buttonState = ButtonState.Fail;
            } else {
                buttonState = ButtonState.Idle;
            }
        } else {
            buttonState = ButtonState.Success;
        }
    };

    const validateMail = async () => {
        const { success } = z.string().email().safeParse(userMail);
        userMailError = !success && userMail.length > 0;
    };
</script>

{#if checkoutStep == 0}
    <div class="mt-4 w-full">
        <StateButton {buttonState} on:click={() => (checkoutStep += 1)}>{buyButtonContent[buttonState]}</StateButton>
    </div>
{:else if checkoutStep == 1}
    <Separator class="my-4 w-full" />

    <form onsubmit={initCheckout}>
        <div class="mb-4 flex w-full flex-col pl-[1px] font-['Segoe_UI'] transition-all">
            <label class="mb-1 leading-[17.1px] text-[#30313D]" for="stripe-email">Adresse mail</label>
            <input
                class="rounded-xl bg-[#F1F1F1] p-4 leading-[18.4px] placeholder:text-[#6c6d79]
                    {userMailError ? 'text-[#df1b41] ring-2 ring-[#df1b41]' : 'ring-0 focus:ring-2 focus:ring-black'}"
                type="email"
                id="stripe-email"
                placeholder="john.doe@domain.com"
                bind:value={userMail}
                onblur={validateMail}
                oninput={() => (userMailError = false)}
            />
            {#if userMailError}
                <p class="text-[#df1b41]">Veuillez entrer une adresse mail valide.</p>
            {/if}

            <div class="mt-4">
                <StateButton type="submit" {buttonState}>{mailButtonContent[buttonState]}</StateButton>
            </div>
        </div>
    </form>
{:else if checkoutStep == 2 && stripe && client_secret}
    <Separator class="my-4 w-full" />

    <form onsubmit={submitCheckout}>
        <Elements
            {stripe}
            rules={{
                ".Input": { border: "none" },
                ".Input:focus": { outline: "solid 2px black", boxShadow: "none" },
            }}
            clientSecret={client_secret}
            theme="flat"
            bind:elements
        >
            <Address fields={{ phone: "never" }} mode="billing" autocomplete={{ mode: "disabled" }} />

            <PaymentElement
                options={{
                    layout: "accordion",
                    wallets: { applePay: "auto", googlePay: "auto" },
                    fields: { billingDetails: { email: "never", name: "never" } },
                }}
            />
        </Elements>

        <div class="mt-4">
            <StateButton type="submit" {buttonState}>{stripeButtonContent[buttonState]}</StateButton>
        </div>
    </form>
{:else}
    <p>Erreur</p>
{/if}
