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
    const { title, description, images, collection, options, variants } = data;

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

    const cartButtonStates: StateButtonContent = {
        Idle: "Ajouter au panier",
        Updating: "Ajout en cours",
        Success: "Ajouté au panier",
        Fail: "Echec de l'ajout",
    };
    let cartButtonState = $state<ButtonState>(ButtonState.Idle);

    const addToCart = async () => {
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
    <meta name="description" content={description} />
</svelte:head>

<div class="mx-auto max-w-[1350px] px-4">
    <div class="mb-4 lg:mb-8">
        <a href="/collections">Collections</a> /
        <a href="/collection/{collection.handle}">{collection.title}</a> /
        <span class="font-bold">{title}</span>
    </div>

    <div class="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:justify-center xl:gap-24">
        <Carousel.Root bind:api class="max-w-[600px]">
            <Carousel.Content>
                {#each images as image, i}
                    <Carousel.Item>
                        <img
                            src={image.url}
                            alt={title}
                            class="m-auto size-[min(90vw,600px)] rounded-lg object-scale-down md:h-[600px] md:w-[600px]"
                            loading={i === 0 ? "eager" : "lazy"}
                        />
                        <div
                            class="bg-dgray/15 relative -top-[min(90vw,600px)] left-0 h-full w-full rounded-lg mix-blend-multiply"
                        ></div>
                    </Carousel.Item>
                {/each}
            </Carousel.Content>
            <Carousel.Previous class="hover:bg-dgray left-2 border-0 bg-transparent" />
            <Carousel.Next class="hover:bg-dgray right-2 border-0 bg-transparent" />
            <p class="text-d-darkgray text-center text-xs">Image {currentImage} sur {images.length}</p>
        </Carousel.Root>

        <div class="w-full max-w-[850px] lg:w-auto lg:grow">
            <h1 class="text-xl font-bold">{title}</h1>
            <p>{(variant.price / 100).toFixed(2)}€</p>
            <p class="mt-2">{description}</p>

            <Separator class="my-4" />

            {#each selectedOptions as option}
                <div class="grid grid-cols-[100px_auto] items-center gap-4 lg:grid-cols-[125px_auto] lg:gap-6">
                    <h2>{option.option}</h2>
                    <OptionPicker choices={options.get(option.option) ?? []} bind:value={option.value} />
                </div>
                <Separator class="my-4" />
            {/each}

            <div class="grid grid-cols-[100px_auto] gap-4 lg:grid-cols-[125px_auto] lg:gap-6">
                <QuantitySelector bind:value={itemQuantity} min={1} max={99} />
                <div class="w-full">
                    <StateButton buttonState={cartButtonState} on:click={addToCart}>
                        <ShoppingBag strokeWidth={2.25} class="size-4" />
                        <p>{cartButtonStates[cartButtonState]}</p>
                    </StateButton>
                </div>
            </div>
        </div>
    </div>
</div>
