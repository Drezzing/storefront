<script lang="ts">
    import { Filter } from "lucide-svelte";

    import ProductDisplay from "$lib/components/ProductDisplay.svelte";
    import { ProductFilter } from "$lib/components/ProductFilter/productFilter.svelte.js";
    import SidePanel from "$lib/components/SidePanel.svelte";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { Label } from "$lib/components/ui/label";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { Slider } from "$lib/components/ui/slider";

    let { data } = $props();
    const { title, thumbnail, products, description, cpv, guideTaille } = data;

    const filter = new ProductFilter(products);
    let count = $derived(filter.selectedProducts.length);
</script>

<svelte:head>
    <title>{title}</title>
    <meta property="og:title" content={title} />
    <meta name="description" content={description} />
    <meta property="og:description" content={description} />

    {#if thumbnail}
        <meta property="og:image" content={thumbnail} />
        <meta property="og:image:type" content="image/webp" />
        <meta property="og:image:width" content="300" />
        <meta property="og:image:height" content="300" />
    {/if}
</svelte:head>

<div class="mx-4 max-w-[1024px] md:px-8 lg:m-auto">
    <div>
        <a href="/collections">Collections</a> / <span class="font-bold">{title}</span>
    </div>

    <section class="my-12 space-y-2 text-center">
        <h1 class="text-4xl font-bold">{title}</h1>
        <p>{description}</p>
    </section>

    <div class="space-y-4">
        {#if cpv || guideTaille}
            <div class="flex flex-row justify-between">
                {#if guideTaille}
                    <a href={guideTaille} class="underline">Guide des tailles</a>
                {/if}

                {#if cpv}
                    <a href={cpv} class="underline">Conditions particulière de vente</a>
                {/if}
            </div>
        {/if}

        <section class="-mx-4 bg-[#EEEEEE] px-4 py-2">
            <div class="flex items-center justify-between">
                <SidePanel>
                    {#snippet trigger()}
                        <div
                            class="inline-flex items-center rounded-sm bg-white px-4 py-2 text-black shadow hover:bg-white/90"
                        >
                            <Filter strokeWidth={1} class="mr-2" />
                            <p class="text-sm">Filtrer</p>
                        </div>
                    {/snippet}
                    {#snippet title()}
                        <h2 class="mx-4 mb-6 mt-3 text-2xl font-bold">Filtrer par</h2>
                    {/snippet}

                    <div class="mx-4 space-y-3">
                        <h2 class="font-bold">Prix</h2>
                        <span>{filter.selectedPrices[0]}€</span> à <span>{filter.selectedPrices[1]}€</span>
                        <Slider class="mx-[8px] w-auto" bind:value={filter.selectedPrices} min={0} max={100} step={5} />
                    </div>

                    {#each filter.options as option (option[0])}
                        {@const key = option[0]}
                        {@const values = option[1]}
                        <Separator class="mx-2 my-6 h-[2px] w-auto bg-[#EEEEEE] md:rounded-full" />

                        <div class="mx-4 space-y-3">
                            <h3 class="font-bold">{key}</h3>

                            {#each values as value (value)}
                                <div class="flex items-center gap-2">
                                    <Checkbox
                                        id={`${key}-${value}`}
                                        class="data-[state=checked]:bg-d-darkgray"
                                        checked={filter.selectedOptions.get(key)?.has(value) ?? false}
                                        onCheckedChange={(v) => filter.handleCheckbox(key, value, v)}
                                    />
                                    <Label for={`${key}-${value}`}>{value}</Label>
                                </div>
                            {/each}
                        </div>
                    {/each}

                    <div class="mb-8 flex flex-row items-center justify-center">
                        <Button class="mx-4 mt-8 w-32" variant="drezzing" onclick={() => filter.resetOptions()}
                            >Réinitialiser</Button
                        >
                    </div>
                </SidePanel>
                <p class="ml-4">{count} produit{count > 1 ? "s" : ""}</p>
            </div>
        </section>

        <ProductDisplay elements={filter.selectedProducts ?? products} />
    </div>
</div>
