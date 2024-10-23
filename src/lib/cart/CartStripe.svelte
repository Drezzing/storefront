<script lang="ts">
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { z } from "zod";
    import { CartName } from "./cart";

    import { toast } from "svelte-sonner";
    import { PUBLIC_STRIPE_API_KEY, PUBLIC_BASE_URL } from "$env/static/public";
    import { loadStripe, type Stripe, type StripeElements } from "@stripe/stripe-js";
    import { Elements, PaymentElement, Address } from "svelte-stripe";
    import StateButton from "$lib/components/StateButton/StateButton.svelte";
    import { ButtonState, type StateButtonContent } from "$lib/components/StateButton/stateButton";
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";
    import { clientRequest, displayClientError } from "$lib/error";

    let stripe: Stripe | null = $state(null);
    onMount(async () => {
        stripe = await loadStripe(PUBLIC_STRIPE_API_KEY);
    });

    let client_secret = $state("");
    let elements: StripeElements | undefined = $state();

    let userData = $state({ firstName: "", lastName: "", mail: "" });
    let userDataError = $state({ firstName: false, lastName: false, mail: false });

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

        let validateFail = false;
        Object.entries(userData).forEach(([key, value]) => {
            const objKey = key as "mail" | "firstName" | "lastName";
            switch (objKey) {
                case "mail":
                    validateMail();
                    break;
                case "firstName":
                case "lastName":
                    validateName(objKey);
                    break;
            }
            if (value === "" || userDataError[objKey]) {
                userDataError[objKey] = true;
                validateFail = true;
            }
        });

        if (validateFail) {
            buttonState = ButtonState.Idle;
            return;
        }

        const response = await clientRequest<{ client_secret: string }>("CART_CHECKOUT_POST", "/api/checkout", {
            method: "POST",
            body: JSON.stringify(userData),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.success) {
            displayClientError(response);
        }

        if (response.success && stripe) {
            client_secret = response.data.client_secret;
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
                receipt_email: userData.mail,
                payment_method_data: {
                    billing_details: { email: userData.mail, name: userData.firstName + " " + userData.lastName },
                },
            },
            redirect: "always",
        });

        if (result.error) {
            if (result.error.type !== "validation_error") {
                toast.error("Une erreur est survenue.", { description: `Code erreur : stripe_${result.error.code}` });
                buttonState = ButtonState.Fail;
                setTimeout(() => (buttonState = ButtonState.Idle), 2500);
            } else {
                buttonState = ButtonState.Idle;
            }
        } else {
            buttonState = ButtonState.Success;
        }
    };

    const validateName = (key: "lastName" | "firstName") => {
        userDataError[key] = !CartName.safeParse(userData[key]).success && userData[key].length > 0;
    };

    const validateMail = () => {
        userDataError.mail = !z.string().email().min(1).safeParse(userData.mail).success && userData.mail.length > 0;
    };
</script>

{#if checkoutStep == 0}
    <div class="mt-4 w-full">
        <StateButton {buttonState} on:click={() => (checkoutStep += 1)}>{buyButtonContent[buttonState]}</StateButton>
    </div>
{:else if checkoutStep == 1}
    <Separator class="my-4 w-full" />

    <form onsubmit={initCheckout}>
        <div class="mb-4 flex w-full flex-col gap-4 pl-[1px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI']">
            <div class="space-y-1">
                <label class="mb-1 block leading-[17.1px] text-[#30313D]" for="stripe-lastname">Nom</label>
                <input
                    class="w-full rounded-xl bg-[#F1F1F1] p-4 leading-[18.4px] placeholder:text-[#6c6d79]
                        {userDataError.lastName
                        ? 'text-[#df1b41] ring-2 ring-[#df1b41]'
                        : 'ring-0 focus:ring-2 focus:ring-black'}"
                    type="text"
                    id="stripe-lastname"
                    placeholder="Doe"
                    bind:value={userData.lastName}
                    onblur={() => validateName("lastName")}
                    oninput={() => (userDataError.lastName = false)}
                />
                {#if userDataError.lastName}
                    <p class="text-[#df1b41]" transition:slide={{ axis: "y", duration: 250 }}>
                        Veuillez entrer un nom valide.
                    </p>
                {/if}
            </div>

            <div class="space-y-1">
                <label class="mb-1 block leading-[17.1px] text-[#30313D]" for="stripe-firstname">Prénom</label>
                <input
                    class="w-full rounded-xl bg-[#F1F1F1] p-4 leading-[18.4px] placeholder:text-[#6c6d79]
                        {userDataError.firstName
                        ? 'text-[#df1b41] ring-2 ring-[#df1b41]'
                        : 'ring-0 focus:ring-2 focus:ring-black'}"
                    type="text"
                    id="stripe-firstname"
                    placeholder="John"
                    bind:value={userData.firstName}
                    onblur={() => validateName("firstName")}
                    oninput={() => (userDataError.firstName = false)}
                />
                {#if userDataError.firstName}
                    <p class="text-[#df1b41]" transition:slide={{ axis: "y", duration: 250 }}>
                        Veuillez entrer un prénom valide.
                    </p>
                {/if}
            </div>

            <div class="space-y-1">
                <label class="mb-1 block leading-[17.1px] text-[#30313D]" for="stripe-firstname">Adresse Mail</label>
                <input
                    class="w-full rounded-xl bg-[#F1F1F1] p-4 leading-[18.4px] placeholder:text-[#6c6d79]
                        {userDataError.mail
                        ? 'text-[#df1b41] ring-2 ring-[#df1b41]'
                        : 'ring-0 focus:ring-2 focus:ring-black'}"
                    type="email"
                    id="stripe-email"
                    placeholder="john.doe@domain.com"
                    bind:value={userData.mail}
                    onblur={validateMail}
                    oninput={() => (userDataError.mail = false)}
                />
                {#if userDataError.mail}
                    <p class="text-[#df1b41]" transition:slide={{ axis: "y", duration: 250 }}>
                        Veuillez entrer une adresse mail valide.
                    </p>
                {/if}
            </div>

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
            locale="fr-FR"
            rules={{
                ".Input": { border: "none" },
                ".Input:focus": { outline: "solid 2px black", boxShadow: "none" },
            }}
            clientSecret={client_secret}
            theme="flat"
            bind:elements
        >
            <Address
                fields={{ phone: "never" }}
                mode="billing"
                autocomplete={{ mode: "disabled" }}
                defaultValues={{ name: userData.firstName + " " + userData.lastName, address: { country: "FR" } }}
            />

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
