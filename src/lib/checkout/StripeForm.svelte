<script lang="ts">
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import X from "@lucide/svelte/icons/x";
    import { type PaymentIntent, type Stripe, type StripeElements } from "@stripe/stripe-js";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { Address, Elements, PaymentElement } from "svelte-stripe";

    import { goto } from "$app/navigation";
    import type { ShippingFormType, UserInfoFormType } from "$lib/schemas/checkout";
    import { ButtonStateEnum, StateButton } from "$lib/components/StateButton";
    import env from "$lib/env/public";
    import { clientRequest, displayClientError } from "$lib/error";

    let {
        stripe,
        userData,
        shippingData,
        client_secret = $bindable(),
    }: {
        stripe: Promise<Stripe | null>;
        userData: UserInfoFormType;
        shippingData: ShippingFormType;
        client_secret: string;
    } = $props();

    let userName = $derived(userData.firstName + " " + userData.lastName);

    const getClientSecret = async () => {
        if (!client_secret) {
            const response = await clientRequest<{ client_secret: string }>("CART_CHECKOUT_POST", "/api/checkout", {
                method: "GET",
            });

            if (!response.success) {
                displayClientError(response);
                return;
            } else {
                client_secret = response.data.client_secret;
            }
        }

        return client_secret;
    };

    const stripeLoaderPromise = Promise.all([stripe, getClientSecret()]);

    let elements: StripeElements | undefined = $state();
    let validateButtonState = $state(ButtonStateEnum.Idle);

    const submitCheckout = async (e: Event) => {
        e.preventDefault();
        validateButtonState = ButtonStateEnum.Updating;
        const stripeSDK = await stripe;

        if (!stripeSDK || !elements) {
            validateButtonState = ButtonStateEnum.Fail;
            setTimeout(() => (validateButtonState = ButtonStateEnum.Idle), 2500);
            return toast.error("Une erreur est survenue.", {
                description: "Impossible de charger Stripe.",
            });
        }

        const elementsValid = await elements.submit();
        if (elementsValid.error) {
            validateButtonState = ButtonStateEnum.Fail;
            setTimeout(() => (validateButtonState = ButtonStateEnum.Idle), 2500);
            return;
        }
        const createTokenResponse = await stripeSDK.createConfirmationToken({
            elements,
            params: {
                return_url: env.get("PUBLIC_BASE_URL") + "/cart/complete",
                payment_method_data: {
                    billing_details: { email: userData.mail, name: userData.firstName + " " + userData.lastName },
                },
            },
        });

        if (createTokenResponse.error) {
            validateButtonState = ButtonStateEnum.Fail;
            setTimeout(() => (validateButtonState = ButtonStateEnum.Idle), 2500);
            return toast.error("Une erreur est survenue.", {
                description: createTokenResponse.error.message,
            });
        }

        const submitTokenResponse = await clientRequest<{
            status: PaymentIntent.Status;
            clientSecret: string;
            redirect: string;
        }>("CART_CHECKOUT_POST", "/api/checkout", {
            method: "POST",
            body: JSON.stringify({ confirmationToken: createTokenResponse.confirmationToken?.id }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!submitTokenResponse.success) {
            validateButtonState = ButtonStateEnum.Fail;
            setTimeout(() => (validateButtonState = ButtonStateEnum.Idle), 2500);
            return displayClientError(submitTokenResponse);
        } else if (submitTokenResponse.data.status === "requires_action") {
            const { error } = await stripeSDK.handleNextAction({ clientSecret: submitTokenResponse.data.clientSecret });
            if (error) {
                validateButtonState = ButtonStateEnum.Fail;
                setTimeout(() => (validateButtonState = ButtonStateEnum.Idle), 2500);
                return toast.error("Une erreur est survenue.", {
                    description: error.message,
                });
            }
        }
        if (submitTokenResponse.data.status !== "canceled") {
            goto(submitTokenResponse.data.redirect);
        }
    };

    onMount(() => {
        // cannot use focus() on the iframe content since it is cross-origin
        // so we focus the iframe itself
        // this is a workaround and not a good one
        const iframe: HTMLIFrameElement | null = document.querySelector("iframe[name^='__privateStripeFrame']");
        if (iframe) {
            iframe.focus();
        }
    });
</script>

{#await stripeLoaderPromise}
    <p class="text-center">Chargement...</p>
{:then [stripe, clientSecret]}
    <form class="px-2" onsubmit={submitCheckout}>
        <Elements
            {stripe}
            {clientSecret}
            locale="fr-FR"
            rules={{
                ".Input": { border: "none" },
                ".Input:focus": { outline: "solid 2px black", boxShadow: "none" },
            }}
            theme="flat"
            bind:elements
        >
            {#key [shippingData, userName]}
                <Address
                    fields={{ phone: "never" }}
                    mode="billing"
                    autocomplete={{ mode: "disabled" }}
                    allowedCountries={["FR"]}
                    defaultValues={{
                        name: userName,
                        address: {
                            line1: shippingData.address,
                            line2: shippingData.complement,
                            postal_code: shippingData.postal_code,
                            city: shippingData.city,
                            country: "FR",
                        },
                    }}
                />
            {/key}

            <PaymentElement
                options={{
                    layout: "accordion",
                    wallets: { applePay: "auto", googlePay: "auto" },
                    fields: { billingDetails: { email: "never", name: "never" } },
                }}
            />
        </Elements>

        <div class="mt-4 w-32 justify-self-center">
            <StateButton state={validateButtonState} type="submit">
                {#snippet idle()}
                    <p>Valider</p>
                {/snippet}

                {#snippet updating()}
                    <LoaderCircle class="animate-spin"></LoaderCircle>
                {/snippet}

                {#snippet fail()}
                    <X />
                {/snippet}
            </StateButton>
        </div>
    </form>
{/await}
