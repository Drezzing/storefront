<script lang="ts">
    import ProductDisplay from "$lib/components/ProductDisplay.svelte";
    import * as Carousel from "$lib/components/ui/carousel/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import PartnerIsima from "$lib/images/partners/inp_isima.jpg";
    import PartnerINP from "$lib/images/partners/inp.jpg";
    import PartnerEpopey from "$lib/images/partners/epopey.jpg";

    const { data } = $props();
</script>

<svelte:head>
    <title>Accueil</title>
    <meta name="description" content="Page d'accueil" />
</svelte:head>

<div class="max-w-[1024px] justify-center space-y-8 md:px-8 lg:m-auto lg:space-y-16">
    <!-- <section class="-mt-6 mb-12 md:mt-0 lg:mb-0">
        <Carousel.Root class="w-full">
            <Carousel.Content>
                <Carousel.Item>
                    <a href="/">
                        <img
                            src="https://via.placeholder.com/600x300"
                            alt="Carousel 1"
                            class="aspect-[2/1] w-full md:rounded"
                        />
                    </a>
                </Carousel.Item>
            </Carousel.Content>
            <Carousel.Previous class="hover:bg-dgray left-4 border-0 bg-transparent" />
            <Carousel.Next class="hover:bg-dgray right-4 border-0 bg-transparent" />
        </Carousel.Root>
    </section> -->

    <section class="justify-center space-y-8 px-4">
        <h2 class="text-center text-xl font-bold">Dernières sorties</h2>
        <ProductDisplay elements={data.products} limitNumber={true} />
    </section>

    <section class="justify-center space-y-8 px-4">
        <h2 class="text-center text-xl font-bold">Dernières collections</h2>
        <ProductDisplay elements={data.collections} route="collection" limitNumber={true} />
    </section>

    <Separator class="my-8 h-8 bg-[#EEEEEE] md:h-4 md:rounded-full lg:hidden" />

    <section class="justify-center space-y-8 px-4">
        <h2 class="text-center font-bold">Nos partenaires</h2>
        <div class="flex flex-row flex-wrap items-center justify-center gap-2 px-4">
            <img src={PartnerINP} alt="Logo Clermont Auvergne INP" class="h-32 object-scale-down" />
            <img src={PartnerIsima} alt="Logo Clermont Auvergne INP - ISIMA" class="h-32 object-scale-down" />
            <img src={PartnerEpopey} alt="Logo Epopey" class="h-28 object-scale-down" />
        </div>
    </section>
</div>
