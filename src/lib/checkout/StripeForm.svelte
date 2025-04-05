<script lang="ts">
    import { type PaymentIntent, type Stripe, type StripeElements } from "@stripe/stripe-js";
    import { LoaderCircle, X } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import { Address, Elements, PaymentElement } from "svelte-stripe";
    import type { z } from "zod";

    import { goto } from "$app/navigation";
    import { env } from "$env/dynamic/public";
    import { shippingFormSchema, userInfoFormSchema } from "$lib/checkout/formSchema";
    import StateButton from "$lib/components/StateButton/StateButton.svelte";
    import { ButtonState } from "$lib/components/StateButton/stateButton";
    import { clientRequest, displayClientError } from "$lib/error";

    let {
        stripe,
        userData,
        shippingData,
        client_secret = $bindable(),
    }: {
        stripe: Promise<Stripe | null>;
        userData: z.infer<typeof userInfoFormSchema>;
        shippingData: z.infer<typeof shippingFormSchema>;
        client_secret: string;
    } = $props();

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
    let validateButtonState: ButtonState = $state(ButtonState.Idle);

    const submitCheckout = async (e: Event) => {
        e.preventDefault();
        validateButtonState = ButtonState.Updating;
        const stripeSDK = await stripe;

        if (!stripeSDK || !elements) {
            validateButtonState = ButtonState.Fail;
            setTimeout(() => (validateButtonState = ButtonState.Idle), 2500);
            return toast.error("Une erreur est survenue.", {
                description: "Impossible de charger Stripe.",
            });
        }

        const elementsValid = await elements.submit();
        if (elementsValid.error) {
            validateButtonState = ButtonState.Fail;
            setTimeout(() => (validateButtonState = ButtonState.Idle), 2500);
            return;
        }
        const createTokenResponse = await stripeSDK.createConfirmationToken({
            elements,
            params: {
                return_url: env.PUBLIC_BASE_URL + "/cart/complete",
                payment_method_data: {
                    billing_details: { email: userData.mail, name: userData.firstName + " " + userData.lastName },
                },
            },
        });

        if (createTokenResponse.error) {
            validateButtonState = ButtonState.Fail;
            setTimeout(() => (validateButtonState = ButtonState.Idle), 2500);
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
            validateButtonState = ButtonState.Fail;
            setTimeout(() => (validateButtonState = ButtonState.Idle), 2500);
            return displayClientError(submitTokenResponse);
        } else if (submitTokenResponse.data.status === "requires_action") {
            const { error } = await stripeSDK.handleNextAction({ clientSecret: submitTokenResponse.data.clientSecret });
            if (error) {
                validateButtonState = ButtonState.Fail;
                setTimeout(() => (validateButtonState = ButtonState.Idle), 2500);
                return toast.error("Une erreur est survenue.", {
                    description: error.message,
                });
            }
        }
        if (submitTokenResponse.data.status !== "canceled") {
            goto(submitTokenResponse.data.redirect);
        }
    };
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
            <Address
                fields={{ phone: "never" }}
                mode="billing"
                autocomplete={{ mode: "disabled" }}
                allowedCountries={["FR"]}
                defaultValues={{
                    name: userData.firstName + " " + userData.lastName,
                    address: {
                        line1: shippingData.address,
                        line2: shippingData.complement,
                        postal_code: shippingData.postal_code,
                        city: shippingData.city,
                        country: "FR",
                    },
                }}
            />

            <PaymentElement
                options={{
                    layout: "accordion",
                    wallets: { applePay: "auto", googlePay: "auto" },
                    fields: { billingDetails: { email: "never", name: "never" } },
                }}
            />
        </Elements>

        <div class="mt-4 w-32 justify-self-center">
            <StateButton buttonState={validateButtonState} type="submit">
                {#if validateButtonState === ButtonState.Idle}
                    <p>Valider</p>
                {:else if validateButtonState === ButtonState.Updating}
                    <LoaderCircle class="animate-spin" />
                {:else if validateButtonState === ButtonState.Success}
                    <!-- should not be seen, user is redirected to other page -->
                    <p>Validé</p>
                {:else if validateButtonState === ButtonState.Fail}
                    <X />
                {/if}
            </StateButton>
        </div>
    </form>
{/await}
