<script lang="ts">
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import X from "@lucide/svelte/icons/x";
    import { loadStripe, type Stripe, type StripeElements } from "@stripe/stripe-js";
    import type { RemoteQuery } from "@sveltejs/kit";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { Address, Elements, PaymentElement } from "svelte-stripe";

    import { goto } from "$app/navigation";
    import { ButtonStateEnum, StateButton } from "$lib/components/StateButton";
    import env from "$lib/env/public";
    import { displayRemoteFunctionError } from "$lib/error";
    import {
        userInfoFormSchema,
        type ShippingMondialRelayHomeType,
        type UserInfoFormType,
    } from "$lib/schemas/checkout";
    import { submitConfirmationToken, type ClientSecretQuery } from "./checkout.remote";

    let {
        userInfo,
        userShippingAddress,
        clientSecretQuery,
    }: {
        userInfo: UserInfoFormType | undefined;
        userShippingAddress: ShippingMondialRelayHomeType | undefined;
        clientSecretQuery: RemoteQuery<ClientSecretQuery> | undefined;
    } = $props();

    let defaultedUserInfo: UserInfoFormType = $derived(
        userInfo ?? {
            firstName: "",
            lastName: "",
            mail: "",
            profile: Object.values(userInfoFormSchema.shape.profile.def.entries)[0],
        },
    );
    let userName = $derived(defaultedUserInfo.firstName + " " + defaultedUserInfo.lastName);

    let stripeSDK: Stripe | null = $state(null);
    let clientSecret: string | undefined = $derived(clientSecretQuery?.current?.client_secret);
    let elements: StripeElements | undefined = $state();
    let stripeReady = $derived(clientSecret != undefined && stripeSDK != undefined && elements != undefined);

    onMount(async () => {
        const stripeSDKPromise = loadStripe(env.get("PUBLIC_STRIPE_API_KEY"));
        stripeSDKPromise.catch(() =>
            toast.error("Une erreur est survenue", { description: "Impossible de charger Stripe." }),
        );

        stripeSDK = await stripeSDKPromise;
    });

    let validateButtonState = $state(ButtonStateEnum.Idle);

    const submitCheckout = async (e: Event) => {
        e.preventDefault();
        validateButtonState = ButtonStateEnum.Updating;

        await clientSecretQuery?.catch((err) => {
            displayRemoteFunctionError(err);
        });

        if (!stripeSDK || !clientSecret || !elements) {
            validateButtonState = ButtonStateEnum.Fail;
            setTimeout(() => (validateButtonState = ButtonStateEnum.Idle), 2500);
            return toast.error("Une erreur est survenue.", {
                description: "Module Stripe non chargé.",
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
                    billing_details: { email: defaultedUserInfo.mail, name: userName },
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

        try {
            const submitTokenResponse = await submitConfirmationToken({
                confirmationToken: createTokenResponse.confirmationToken?.id,
            });

            if (submitTokenResponse.status === "requires_action") {
                const { error } = await stripeSDK.handleNextAction({ clientSecret: submitTokenResponse.clientSecret });
                if (error) {
                    validateButtonState = ButtonStateEnum.Fail;
                    setTimeout(() => (validateButtonState = ButtonStateEnum.Idle), 2500);
                    return toast.error("Une erreur est survenue.", {
                        description: error.message,
                    });
                }
            }

            if (submitTokenResponse.status !== "canceled") {
                goto(submitTokenResponse.redirect);
            }
        } catch (e) {
            validateButtonState = ButtonStateEnum.Fail;
            setTimeout(() => (validateButtonState = ButtonStateEnum.Idle), 2500);
            return displayRemoteFunctionError(e);
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

<form class="px-2" onsubmit={submitCheckout}>
    <Elements
        stripe={clientSecret === undefined ? null : stripeSDK}
        {clientSecret}
        locale="fr-FR"
        rules={{
            ".Input": { border: "none" },
            ".Input:focus": { outline: "solid 2px black", boxShadow: "none" },
        }}
        theme="flat"
        bind:elements
    >
        {#key [userShippingAddress, userName]}
            <Address
                fields={{ phone: "never" }}
                mode="billing"
                autocomplete={{ mode: "disabled" }}
                allowedCountries={["FR"]}
                defaultValues={{
                    name: userName,
                    address: {
                        line1: userShippingAddress?.address,
                        line2: userShippingAddress?.complement,
                        postal_code: userShippingAddress?.postal_code,
                        city: userShippingAddress?.city,
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
        <StateButton state={validateButtonState} type="submit" disabled={!stripeReady}>
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
