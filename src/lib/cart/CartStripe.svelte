<script lang="ts">
    import { type Stripe, type StripeElements } from "@stripe/stripe-js";
    import { toast } from "svelte-sonner";
    import { Address, Elements, PaymentElement } from "svelte-stripe";

    import { PUBLIC_BASE_URL } from "$env/static/public";
    import { clientRequest } from "$lib/error";

    let {
        stripe,
        userData,
        client_secret = $bindable(),
    }: {
        stripe: Promise<Stripe | null>;
        userData: { mail: string; firstName: string; lastName: string };
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

        const result = await stripeSDK.confirmPayment({
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
            }
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

        <button type="submit">Validerw</button>
    </form>
{/await}
