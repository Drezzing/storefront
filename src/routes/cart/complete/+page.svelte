<script lang="ts">
    let { data } = $props();
    let { status } = data;

    $inspect(status);

    type ContentMap = {
        [key in typeof status]: {
            title: string;
            content: string;
        };
    };

    const contentMap: ContentMap = {
        succeeded: {
            title: "Merci pour votre commande.",
            content:
                "Votre commande a été enregistrée. Vous devrez recevoir un reçu et un récapitulatif de votre commande " +
                "par mail prochainement.",
        },
        pending: {
            title: "Le traitement de votre paiement est en cours.",
            content:
                "Un reçu et un récapitulatif de votre commande vous seront envoyé par mail si le paiement est accepté. " +
                "Dans le cas contraire, un mail vous invitant à ré-essayer vous sera envoyé.",
        },
        failed: {
            title: "Echec de l'autorisation de votre paiement",
            content: "Veuillez ré-essayer ou essayer avec un autre mode de paiement.",
        },
    };
</script>

<div class="max-w-[1024px] space-y-12 px-4 md:px-8 lg:m-auto">
    <h1 class="text-center text-3xl font-bold">{contentMap[status].title}</h1>
    <p class="text-justify">{contentMap[status].content}</p>
</div>
