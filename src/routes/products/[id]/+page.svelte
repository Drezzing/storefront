<script lang="ts">
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import ShoppingBag from "@lucide/svelte/icons/shopping-bag";
    import InfoIcon from "@lucide/svelte/icons/info";

    import { addProductToCart } from "$lib/cart/cart.remote.js";
    import OptionPicker from "$lib/components/OptionPicker.svelte";
    import QuantitySelector from "$lib/components/QuantitySelector.svelte";
    import { ButtonStateEnum, StateButton } from "$lib/components/StateButton";
    import type { CarouselAPI } from "$lib/components/ui/carousel/context.js";
    import * as Carousel from "$lib/components/ui/carousel/index.js";
    import { Separator } from "$lib/components/ui/separator";
    import { displayRemoteFunctionError } from "$lib/error.js";
    import { SIZE_MAP } from "$lib/public/products";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import { ProductSelector } from "./productSelector.svelte.js";

    let { data } = $props();
    const { title, description, thumbnail, commonImages, collection, options, variants } = data;

    let itemQuantity = $state(1);
    let buttonState = $state(ButtonStateEnum.Idle);

    if (options.has("Taille")) {
        options.get("Taille")!.sort((a, b) => SIZE_MAP[a.toLowerCase()] - SIZE_MAP[b.toLowerCase()]);
    }

    const productSelector = new ProductSelector(options, variants);

    const addToCart = async () => {
        if (productSelector.selectedVariant.soldout) {
            return;
        }

        buttonState = ButtonStateEnum.Updating;

        try {
            await addProductToCart({ product_id: productSelector.selectedVariant.id, quantity: itemQuantity });
            buttonState = ButtonStateEnum.Success;
        } catch (e) {
            buttonState = ButtonStateEnum.Fail;
            displayRemoteFunctionError(e);
        }
        setTimeout(() => (buttonState = ButtonStateEnum.Idle), 2500);
    };

    let api = $state<CarouselAPI>();
    let carouselImages = $derived([...productSelector.selectedVariant.images, ...commonImages]);

    let currentImage = $state(1);
    let imageCount = $derived(carouselImages.length);

    $effect(() => {
        if (api) {
            api.on("select", (api) => {
                currentImage = api.selectedScrollSnap() + 1;
            });
        }
    });
</script>

<svelte:head>
    <title>{title}</title>
    <meta property="og:title" content={title} />
    <meta name="description" content={description} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={thumbnail} />
    <meta property="og:image:type" content="image/webp" />
    <meta property="og:image:width" content="300" />
    <meta property="og:image:height" content="300" />
</svelte:head>

<div class="mx-auto max-w-[1350px] px-4">
    <div class="mb-4 lg:mb-8">
        <a href="/collections">Collections</a> /
        <a href="/collection/{collection.handle}">{collection.title}</a> /
        <span class="font-bold">{title}</span>
    </div>

    <div class="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center xl:gap-24">
        <Carousel.Root setApi={(emblaApi) => (api = emblaApi)} class="max-w-[600px]">
            <Carousel.Content>
                {#each carouselImages as image, i (image.url)}
                    <Carousel.Item>
                        <img
                            src={image.url}
                            alt={image.alt}
                            class="bg-dgray/10 m-auto size-[min(90vw,600px)] rounded-lg object-scale-down md:min-h-[600px] md:min-w-[600px]"
                            loading={i === 0 ? "eager" : "lazy"}
                        />
                    </Carousel.Item>
                {/each}
            </Carousel.Content>
            <Carousel.Previous class="hover:bg-dgray left-2 border-0 bg-transparent" />
            <Carousel.Next class="hover:bg-dgray right-2 border-0 bg-transparent" />
            <p class="text-d-darkgray mt-2 text-center text-xs">Image {currentImage} sur {imageCount}</p>
        </Carousel.Root>

        <div class="flex w-full max-w-[850px] flex-col gap-4 lg:w-auto lg:grow lg:gap-16">
            <div>
                <h1 class="text-xl font-bold">{title}</h1>
                <p>{(productSelector.selectedVariant.price / 100).toFixed(2)}€</p>
                <p class="mt-2">{description}</p>
                {#if collection.metadata?.cpv}
                    <a class="underline" href={collection.metadata.cpv as string}>Conditions particulières de ventes</a>
                {/if}
            </div>

            <div>
                <Separator class="mb-4 lg:hidden" />
                {#each productSelector.selectedOptions as option, i (option.option)}
                    {#if i > 0}
                        <Separator class="my-4" />
                    {/if}
                    <div class="grid grid-cols-[100px_auto] items-center gap-4 lg:grid-cols-[125px_auto] lg:gap-6">
                        {#if collection.metadata?.["guide-taille"] && option.option === "Taille"}
                            <div class="flex flex-row items-center gap-4">
                                <h2>{option.option}</h2>
                                <Tooltip.Provider>
                                    <Tooltip.Root>
                                        <Tooltip.Trigger>
                                            <a href={collection.metadata?.["guide-taille"] as string}
                                                ><InfoIcon strokeWidth={1.5} /></a
                                            ></Tooltip.Trigger
                                        >
                                        <Tooltip.Content>
                                            <p>Guide des tailles</p>
                                        </Tooltip.Content>
                                    </Tooltip.Root>
                                </Tooltip.Provider>
                            </div>
                        {:else}
                            <h2>{option.option}</h2>
                        {/if}
                        <OptionPicker
                            choices={productSelector.availableOptions.get(option.option) ?? []}
                            bind:value={option.value}
                        />
                    </div>
                {/each}
                <Separator class="mt-4 lg:hidden" />
            </div>

            <div class="mt-2 grid grid-cols-[100px_auto] gap-4 lg:grid-cols-[125px_auto] lg:gap-6">
                <QuantitySelector bind:value={itemQuantity} min={1} max={99} />
                <StateButton
                    class="w-full"
                    state={productSelector.selectedVariant.soldout ? ButtonStateEnum.Updating : buttonState}
                    onclick={addToCart}
                >
                    {#snippet idle()}
                        <ShoppingBag strokeWidth={2.25} class="size-4" />
                        <p class="text-wrap">Ajouter au panier</p>
                    {/snippet}

                    {#snippet updating()}
                        {#if productSelector.selectedVariant.soldout}
                            <p class="text-wrap">Produit plus disponible à la vente</p>
                        {:else}
                            <LoaderCircle class="animate-spin" />
                        {/if}
                    {/snippet}

                    {#snippet success()}
                        <ShoppingBag strokeWidth={2.25} class="size-4" />
                        <p class="text-wrap">Ajouté au panier</p>
                    {/snippet}

                    {#snippet fail()}
                        <ShoppingBag strokeWidth={2.25} class="size-4" />
                        <p class="text-wrap">Echec de l'ajout</p>
                    {/snippet}
                </StateButton>
            </div>
        </div>
    </div>
</div>
