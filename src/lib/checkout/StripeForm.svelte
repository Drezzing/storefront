<script lang="ts">
    import { type Stripe, type StripeElements, type PaymentIntent } from "@stripe/stripe-js";
    import { toast } from "svelte-sonner";
    import { Address, Elements, PaymentElement } from "svelte-stripe";
    import type { z } from "zod";

    import { userInfoFormSchema, shippingFormSchema } from "$lib/checkout/formSchema";
    import { PUBLIC_BASE_URL } from "$env/static/public";
    import { clientRequest } from "$lib/error";
    import { goto } from "$app/navigation";

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
                toast.error("erreur");
                throw new Error();
            } else {
                client_secret = response.data.client_secret;
            }
        }

        return client_secret;
    };

    const stripeLoaderPromise = Promise.all([stripe, getClientSecret()]);

    let elements: StripeElements | undefined = $state();

    const submitCheckout = async (e: Event) => {
        e.preventDefault();
        const stripeSDK = await stripe;

        if (!stripeSDK || !elements) {
            return;
        }

        const elementsValid = await elements.submit();
        if (elementsValid.error) {
            return toast.error("Une erreur est survenue.", {
                description: elementsValid.error.message,
            });
        }
        const createTokenResponse = await stripeSDK.createConfirmationToken({
            elements,
            params: {
                return_url: PUBLIC_BASE_URL + "/cart/complete",
                payment_method_data: {
                    billing_details: { email: userData.mail, name: userData.firstName + " " + userData.lastName },
                },
            },
        });

        if (createTokenResponse.error) {
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
            return toast.error("qsf");
        } else if (submitTokenResponse.data.status === "requires_action") {
            await stripeSDK.handleNextAction({ clientSecret: submitTokenResponse.data.clientSecret });
            // TODO : Error handling
        }

        goto(submitTokenResponse.data.redirect);
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

        <button type="submit">Valider</button>
    </form>
{/await}
