<script lang="ts">
    import { Mail } from "lucide-svelte";
    import { Separator } from "$lib/components/ui/separator/index.js";
</script>

<svelte:head>
    <title>FAQ</title>
    <meta property="og:title" content="FAQ" />
    <meta
        name="description"
        content="Vous trouverez ici les réponses aux questions fréquemment posées sur DreZZing, incluant les délais de livraison, les retours, les modes de paiement et plus encore."
    />
    <meta
        property="og:description"
        content="Vous trouverez ici les réponses aux questions fréquemment posées sur DreZZing, incluant les délais de livraison, les retours, les modes de paiement et plus encore."
    />
</svelte:head>

<article class="max-w-[1024px] px-4 md:px-8 lg:m-auto">
    <h1 class="mb-8 text-center text-3xl font-bold">FAQ</h1>

    <div class="space-y-8 text-justify">
        <!-- Question sur les tailles -->
        <!-- <section class="space-y-2">
            <h2 class="text-lg font-bold">Comment choisir la bonne taille ?</h2>
            <p>
                Nous recommandons de consulter notre guide des tailles disponible sur chaque page produit. Si vous êtes
                entre deux tailles, il est généralement conseillé de prendre la taille au-dessus pour un meilleur
                confort.
            </p>
        </section> -->

        <!-- Question sur les délais de livraison -->
        <section class="space-y-2">
            <h2 class="text-lg font-bold">Quels sont les délais de livraison ?</h2>
            <p>
                Les délais de livraison varient en fonction des fournisseurs et de comment sont passés les commandes.
                Certains produits sont achetés à l'unités alors que d'autres sont achetés à interval régulier. Dans tous
                les cas, vous recevrez un mail pour vous informer quand votre commande sera disponible.
            </p>
        </section>

        <!-- Question sur les retours et échanges -->
        <section class="space-y-2">
            <h2 class="text-lg font-bold">Puis-je retourner ou échanger un article ?</h2>
            <p>
                Oui, vous pouvez retourner ou échanger un article selon les modalités prévus par les <a
                    href="/cgv#retours-echanges"
                    class="underline">conditions générales de vente</a
                >.
            </p>
        </section>

        <!-- Question sur les modes de paiement -->
        <section class="space-y-2">
            <h2 class="text-lg font-bold">Quels modes de paiement acceptez-vous ?</h2>
            <p>
                Nous acceptons les principales cartes de crédit, PayPal ainsi que Google Pay (et prochainement Apple
                Pay). Les paiements se font par l'intermédiaire de Stripe, qui garantit la sécurité de vos données. Nous
                ne collectons aucune information sur le mode de paiement utilisé.
            </p>
        </section>

        <section class="space-y-2">
            <h2 class="text-lg font-bold">Quelles sont les informations collectées ?</h2>
            <p>
                Nous ne collectons que les informations strictements nécessaires au bon fonctionnement de DreZZing et
                drezzing.fr. Le détails est disponible dans les <a href="/legal#privacy" class="underline"
                    >mentions légales</a
                >.
            </p>
        </section>
    </div>

    <!-- Ligne de séparation -->
    <Separator class="my-6 h-[2px] rounded bg-dgray" />

    <!-- Message de contact -->
    <div class="flex flex-col items-center gap-1 md:flex-row md:justify-around">
        <h3 class="pb-4 italic md:pb-0">Vous ne trouvez pas la réponse à votre question ?</h3>
        <div class="flex justify-center">
            <div class="flex justify-center">
                <a
                    href="/contact"
                    class="flex w-80 items-center justify-center gap-4 rounded-lg bg-[#2C2C2C] px-4 py-2 text-white hover:bg-[#363636]"
                >
                    <Mail size={26} strokeWidth={1.5} />
                    Contactez-nous
                </a>
            </div>
        </div>
    </div>
</article>
