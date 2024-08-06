<script lang="ts">
    import OptionPicker from '$lib/components/option-picker.svelte';
    import ColorPicker from '$lib/components/ColorPicker.svelte';
    import * as Carousel from "$lib/components/ui/carousel/index.js";
    // import * as Card from "$lib/components/ui/card/index.js";


    let { data } = $props();

    // console.log(product, options)

    // const optionSelected = $state<Record<string, string>>({});
    // for (const [name, values] of data.options) {
    //     optionSelected[name] = values[0];
    // }

    const KEY_MAP: Record<string, string> = {
        "price-etu": "Prix étudiant",
        "price-adh": "Prix adhérent",
        "price-normal": "Plein tarif"
    }

    // let variant
    let taille = $state("")
    let couleur = $state("")
    let tarif = $state("")

    const variantTitle = $derived(`${data.product.handle}-${tarif}-${couleur}-${taille}`)
    const variant = $derived(data.product.variants.find(variant => variant.title === variantTitle));
    // $inspect(variantTitle, variant)

</script>

<div class="flex w-screen justify-center px-4">
    <div class="flex flex-col justify-left gap-4">
        <div class="">
            <a href="/collections">Collections</a> /
            <a href="/collections/{data.product.collection?.handle}">{data.product.collection?.title}</a> /
            <span class="font-bold">{data.product.title}</span>
        </div>
        
        <div>
            <Carousel.Root class="w-11/12 m-auto md:w-[600px]">
                <Carousel.Content>
                    {#each data.product.images! as image}
                        <Carousel.Item>
                            {console.log("carousel image :", image.url)}
                            <img src={image.url} alt="mljqsmlf" class="w-10/12 md:w-[600px] object-scale-down m-auto">
                        </Carousel.Item>
                    {/each}
                </Carousel.Content>
                <Carousel.Previous class="-left-2 border-0 bg-transparent hover:bg-dgray"/>
                <Carousel.Next class="-right-2 border-0 bg-transparent hover:bg-dgray"/>
            </Carousel.Root>
        </div>

        <h1 class="font-bold">{data.product.title}</h1>
        <div>
            <ul class="list-disc list-inside">
                {#each Object.entries(data.product.metadata ?? {}) as metadata}
                    {@const key = metadata[0]}
                    {@const value = metadata[1]}
                    {#if key.startsWith("price")}
                        <li><span class="font-bold">{value}€</span> <span>{KEY_MAP[key]}</span></li>
                    {/if}
                {/each}
            </ul>
        </div>

        <ColorPicker choices={data.options.couleur!} bind:value={couleur}></ColorPicker>
    </div>
</div>

<!-- <h1>{data.product.title} - {variant?.id}</h1>
<p>{data.product.description}</p> -->

<!-- {#if data.options.tarif}
    <h2>Tarif - {tarif}</h2>
    <OptionPicker choices={data.options.tarif} bind:value={tarif}> </OptionPicker>
{/if}

{#if data.options.couleur}
    <h2>Couleur</h2>
    <OptionPicker choices={data.options.couleur} bind:value={couleur}> </OptionPicker>
{/if}

{#if data.options.taille}
    <h2>Taille</h2>
    <OptionPicker choices={data.options.taille} bind:value={taille}> </OptionPicker>
{/if} -->

<!-- {#each data.options as option}
    {@const optionName = option[0]}
    {@const optionValues = option[1]}
    
    <p>{optionName} - {optionSelected[optionName]}</p>

    <ToggleGroup.Root type="single" bind:value={optionSelected[optionName]}>
        {#each optionValues as optionValue}
            <ToggleGroup.Item value={optionValue}>{optionValue.slice(0, 1).toUpperCase() + optionValue.slice(1).toLowerCase()}</ToggleGroup.Item>
        {/each}
    </ToggleGroup.Root>

{/each} -->

<!-- <pre>{JSON.stringify(data.product, null, 4)}</pre> -->
