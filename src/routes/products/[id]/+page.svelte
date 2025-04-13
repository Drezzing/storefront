<script lang="ts">
    import { error } from "@sveltejs/kit";
    import { ShoppingBag } from "lucide-svelte";

    import * as Carousel from "$lib/components/ui/carousel/index.js";
    import type { CarouselAPI } from "$lib/components/ui/carousel/context.js";
    import { Separator } from "$lib/components/ui/separator";

    import { SIZE_MAP } from "$lib/medusa/product";
    import OptionPicker from "$lib/components/OptionPicker.svelte";
    import QuantitySelector from "$lib/components/QuantitySelector.svelte";
    import StateButton from "$lib/components/StateButton/StateButton.svelte";
    import { ButtonState, type StateButtonContent } from "$lib/components/StateButton/stateButton.js";
    import { clientRequest, displayClientError } from "$lib/error.js";

    let { data } = $props();
    const { title, description, thumbnail, commonImages, collection, options, variants } = data;

    let api: CarouselAPI | undefined = $state(undefined);
    let currentImage = $state(1);

    $effect(() => {
        if (api) {
            api.on("select", (api) => {
                currentImage = api.selectedScrollSnap() + 1;
            });
        }
    });

    let itemQuantity = $state(1);

    if (options.has("Taille")) {
        options.get("Taille")!.sort((a, b) => SIZE_MAP[a.toLowerCase()] - SIZE_MAP[b.toLowerCase()]);
    }

    let selectedOptions = $state<{ option: string; value: string }[]>([]);
    options.forEach((values, key) => {
        selectedOptions.push({ option: key, value: values[0] });
    });

    let variant = $derived.by(() => {
        const optionsSet = new Set(selectedOptions.map((option) => option.value));
        const v = variants.find((variant) => {
            return (
                variant.options.size === optionsSet.size && [...variant.options].every((value) => optionsSet.has(value))
            );
        });
        if (v === undefined) error(500);

        return v;
    });
    let carouselImages = $derived([...variant.images, ...commonImages]);
    let imageCount = $derived(carouselImages.length);

    const cartButtonStates: StateButtonContent = {
        Idle: "Ajouter au panier",
        Updating: "Ajout en cours",
        Success: "Ajouté au panier",
        Fail: "Echec de l'ajout",
    };
    let cartButtonState = $state<ButtonState>(ButtonState.Idle);

    const addToCart = async () => {
        if (variant.soldout) {
            return;
        }

        cartButtonState = ButtonState.Updating;

        const response = await clientRequest("PRODUCT_CART_POST", "/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                product_id: variant.id,
                quantity: itemQuantity,
            }),
        });

        if (!response.success) {
            displayClientError(response);
        }

        cartButtonState = response.success ? ButtonState.Success : ButtonState.Fail;
        setTimeout(() => (cartButtonState = ButtonState.Idle), 2500);
    };
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
        <Carousel.Root bind:api class="max-w-[600px]">
            <Carousel.Content>
                {#each carouselImages as image, i (image)}
                    <Carousel.Item>
                        <img
                            src={image}
                            alt={title}
                            class="m-auto size-[min(90vw,600px)] rounded-lg bg-dgray/10 object-scale-down md:min-h-[600px] md:min-w-[600px]"
                            loading={i === 0 ? "eager" : "lazy"}
                        />
                    </Carousel.Item>
                {/each}
            </Carousel.Content>
            <Carousel.Previous class="left-2 border-0 bg-transparent hover:bg-dgray" />
            <Carousel.Next class="right-2 border-0 bg-transparent hover:bg-dgray" />
            <p class="mt-2 text-center text-xs text-d-darkgray">Image {currentImage} sur {imageCount}</p>
        </Carousel.Root>

        <div class="flex w-full max-w-[850px] flex-col gap-4 lg:w-auto lg:grow lg:gap-16">
            <div>
                <h1 class="text-xl font-bold">{title}</h1>
                <p>{(variant.price / 100).toFixed(2)}€</p>
                <p class="mt-2">{description}</p>
            </div>

            <div>
                <Separator class="mb-4 lg:hidden" />
                {#each selectedOptions as option, i (option.option)}
                    {#if i > 0}
                        <Separator class="my-4" />
                    {/if}
                    <div class="grid grid-cols-[100px_auto] items-center gap-4 lg:grid-cols-[125px_auto] lg:gap-6">
                        <h2>{option.option}</h2>
                        <OptionPicker choices={options.get(option.option) ?? []} bind:value={option.value} />
                    </div>
                {/each}
                <Separator class="mt-4 lg:hidden" />
            </div>

            <div class="mt-2 grid grid-cols-[100px_auto] gap-4 lg:grid-cols-[125px_auto] lg:gap-6">
                <QuantitySelector bind:value={itemQuantity} min={1} max={99} />
                <div class="w-full">
                    <StateButton
                        buttonState={variant.soldout ? ButtonState.Updating : cartButtonState}
                        on:click={addToCart}
                    >
                        <ShoppingBag strokeWidth={2.25} class="size-4" />
                        <p class="text-wrap">
                            {variant.soldout ? "Produit plus disponible à la vente" : cartButtonStates[cartButtonState]}
                        </p>
                    </StateButton>
                </div>
            </div>
        </div>
    </div>
</div>
