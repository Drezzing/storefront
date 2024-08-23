<script lang="ts">
    import OptionPicker from "$lib/components/OptionPicker.svelte";
    import QuantitySelector from "$lib/components/QuantitySelector.svelte";
    import * as Carousel from "$lib/components/ui/carousel/index.js";
    import { Separator } from "$lib/components/ui/separator";

    import AddToCartSVG from "$lib/images/add-to-cart.svg?raw";
    import StateButton from "$lib/components/StateButton/StateButton.svelte";
    import { ButtonState, type StateButtonContent } from "$lib/components/StateButton/stateButton.js";

    let { data } = $props();
    const { product, options } = data;

    let taille = $state("");
    let couleur = $state("");
    let itemQuantity = $state(1);

    const cartButtonStates: StateButtonContent = {
        Idle: "Ajouter au panier",
        Updating: "Ajout en cours",
        Success: "Ajouté au panier",
        Fail: "Echec de l'ajout",
    };
    let cartButtonState = $state<ButtonState>(ButtonState.Idle);

    if (options.couleur) couleur = options.couleur[0];
    if (options.taille) taille = options.taille[0];

    const variantTitle = $derived.by(() => {
        let variantTitle = `${product.handle}-normal`;

        if (couleur) {
            variantTitle = variantTitle.concat(`-${couleur}`);
        }

        if (taille) {
            variantTitle = variantTitle.concat(`-${taille}`);
        }

        return variantTitle;
    });

    const addToCart = async () => {
        cartButtonState = ButtonState.Updating;

        const req = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                product_id: variant.id,
                quantity: itemQuantity,
            }),
        });

        const response: { success: boolean; message: string; cart_id: string | null } = await req.json();

        cartButtonState = response.success ? ButtonState.Success : ButtonState.Fail;
        setTimeout(() => (cartButtonState = ButtonState.Idle), 2500);
    };

    const variant = $derived(product.variants.find((variant) => variant.title === variantTitle))!;
</script>

<div class="flex w-screen justify-center px-4">
    <div class="justify-left flex flex-col gap-4">
        <div>
            <a href="/collections">Collections</a> /
            <a href="/collections/{product.collection?.handle}">{product.collection?.title}</a> /
            <span class="font-bold">{product.title}</span>
        </div>

        <div>
            <Carousel.Root class="m-auto w-11/12 md:w-[600px]">
                <Carousel.Content>
                    {#each product.images! as image}
                        <Carousel.Item>
                            <img src={image.url} alt="mljqsmlf" class="m-auto w-10/12 object-scale-down md:w-[600px]" />
                        </Carousel.Item>
                    {/each}
                </Carousel.Content>
                <Carousel.Previous class="hover:bg-dgray -left-2 border-0 bg-transparent" />
                <Carousel.Next class="hover:bg-dgray -right-2 border-0 bg-transparent" />
            </Carousel.Root>
        </div>

        <div>
            <div>
                <h1 class="font-bold">{product.title}</h1>
                <p>{(variant.original_price! / 100).toFixed(2)}€</p>
            </div>

            <Separator class="my-4" />

            {#if options.couleur}
                <div class="grid grid-cols-[25%_auto] items-center gap-4">
                    <h2>Couleur</h2>
                    <OptionPicker choices={options.couleur} bind:value={couleur} />
                </div>
                <Separator class="my-4" />
            {/if}

            {#if options.taille}
                <div class="grid grid-cols-[25%_auto] items-center gap-4">
                    <h2>Taille</h2>
                    <OptionPicker choices={options.taille} bind:value={taille} />
                </div>
                <Separator class="my-4" />
            {/if}

            <div class="grid grid-cols-[25%_auto] gap-4">
                <QuantitySelector bind:value={itemQuantity} min={1} max={99} />
                <div class="w-full">
                    <StateButton buttonState={cartButtonState} on:click={addToCart}>
                        <div class="size-4 fill-white text-white">
                            {@html AddToCartSVG}
                        </div>
                        <p>{cartButtonStates[cartButtonState]}</p>
                    </StateButton>
                </div>
            </div>
        </div>
    </div>
</div>
