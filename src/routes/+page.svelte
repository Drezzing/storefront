<!-- <h1 class="h-6 m-auto">Hello world</h1> -->

<script lang="ts">
    import * as Carousel from "$lib/components/ui/carousel/index.js";
    import { Button } from "$lib/components/ui/button";
    import { Separator } from "$lib/components/ui/separator/index.js";
</script>

<svelte:head>
    <title>Acceuil</title>
    <meta name="description" content="Home page" />
</svelte:head>

<div class="max-w-[1024px] justify-center md:px-8 lg:m-auto lg:space-y-16">
    <section class="-mt-4 mb-12 md:mt-0 lg:mb-0">
        <Carousel.Root class="w-full">
            <Carousel.Content>
                <!-- TODO: replace each item with a snippet -->
                <Carousel.Item>
                    <a href="/test">
                        <img src="https://via.placeholder.com/600x300" alt="mljqsmlf" class="w-full md:rounded" />
                    </a>
                </Carousel.Item>
                <Carousel.Item>
                    <a href="/test2">
                        <img src="https://via.placeholder.com/600x300" alt="mljqsmlf" class="w-full md:rounded" />
                    </a>
                </Carousel.Item>
                <Carousel.Item>
                    <a href="/test3">
                        <img src="https://via.placeholder.com/600x300" alt="mljqsmlf" class="w-full md:rounded" />
                    </a>
                </Carousel.Item>
            </Carousel.Content>
            <Carousel.Previous class="hover:bg-dgray left-4 border-0 bg-transparent" />
            <Carousel.Next class="hover:bg-dgray right-4 border-0 bg-transparent" />
        </Carousel.Root>

        <!-- Not really needed since we can just make the images clickable -->
        <!-- <div class="relative z-[1] -mt-[60px] flex justify-center">
            <Button class="h-3 rounded-full bg-white px-16 py-4 text-black">Découvrir</Button>
        </div> -->
    </section>

    <section class="justify-center space-y-8 text-center">
        <h2 class="text-xl font-bold">Dernière sortie</h2>
        <div class="grid grid-cols-2 items-center justify-center gap-6 px-4 md:grid-cols-3 lg:grid-cols-4">
            <!-- TODO: replace each item with a snippet -->
            <!-- TODO: SM: 4 items, MD: 6 items, LG: 8 itms -->
            <div class="space-y-4">
                <img src="https://via.placeholder.com/600x600" alt="mljqsmlf" class="rounded-full" />
                <p>Hoodie 30 ans</p>
            </div>
            <div class="space-y-4">
                <img src="https://via.placeholder.com/600x600" alt="mljqsmlf" class="rounded-full" />
                <p>Polo Isima</p>
            </div>
            <div class="space-y-4">
                <img src="https://via.placeholder.com/600x600" alt="mljqsmlf" class="rounded-full" />
                <p>Polo Isima</p>
            </div>
            <div class="space-y-4">
                <img src="https://via.placeholder.com/600x600" alt="mljqsmlf" class="rounded-full" />
                <p>Polo Isima</p>
            </div>
            <div class="space-y-4">
                <img src="https://via.placeholder.com/600x600" alt="mljqsmlf" class="rounded-full" />
                <p>Polo Isima</p>
            </div>
            <div class="space-y-4">
                <img src="https://via.placeholder.com/600x600" alt="mljqsmlf" class="rounded-full" />
                <p>Polo Isima</p>
            </div>
        </div>
    </section>

    <Separator class="my-8 h-8 bg-[#EEEEEE] md:h-4 md:rounded-full lg:hidden" />

    <section class="justify-center space-y-8">
        <h2 class="text-center font-bold">Nos partenaires</h2>
        <div class="grid grid-cols-2 items-center gap-2 px-4">
            <div class="justify-self-end">
                <img src="https://via.placeholder.com/500x400" alt="mljqsmlf" />
            </div>
            <div class="justify-self-start">
                <img src="https://via.placeholder.com/600x300" alt="mljqsmlf" />
            </div>
        </div>
    </section>
</div>
