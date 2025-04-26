<script lang="ts">
    import { Filter } from "lucide-svelte";
    import { SvelteMap, SvelteSet } from "svelte/reactivity";

    import ProductDisplay from "$lib/components/ProductDisplay.svelte";
    import SidePanel from "$lib/components/SidePanel.svelte";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { Label } from "$lib/components/ui/label";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { Slider } from "$lib/components/ui/slider";

    let { data } = $props();
    const { title, thumbnail, products, description, cpv, guideTaille, allOptions } = data;

    let optionSelector = new SvelteMap<string, SvelteSet<string>>();
    for (const [key] of allOptions) {
        optionSelector.set(key, new SvelteSet<string>());
    }

    const resetOptions = (options: SvelteMap<string, SvelteSet<string>>) => {
        for (const [key] of options) {
            options.get(key)?.clear();
        }
        priceValues = [0, 100];
    };

    const handleCheckbox = (key: string, value: string, v: boolean | "indeterminate") => {
        if (v === "indeterminate") return;

        if (v === false) {
            optionSelector.get(key)?.delete(value);
        } else {
            optionSelector.get(key)?.add(value);
        }
    };

    const filterProducts = (selectedOptions: SvelteMap<string, SvelteSet<string>>, selectedPrices: number[]) => {
        return products.filter((product) => {
            let keep = true;
            for (const [key, values] of selectedOptions) {
                // this option has no value selected, ignoring
                if (values.size == 0) continue;

                // this product does not have this option
                if (product.options.get(key) === undefined) {
                    keep = false;
                    break;
                }
                // the requested options are not on product
                // TODO: this set should not be re-created every time
                if (new Set(product.options.get(key)).intersection(selectedOptions.get(key)!).size === 0) {
                    keep = false;
                    break;
                }
            }

            if (keep) {
                keep = false;

                // keeping the product if one of its variant is in price range
                const [priceMin, priceMax] = selectedPrices;
                for (const price of product.prices) {
                    if (price === null) continue;

                    // one price is valid, we keep the product so we don't need to check the other prices
                    const priceDec = price / 100;
                    if (priceDec >= priceMin && priceDec <= priceMax) {
                        keep = true;
                        break;
                    }
                }
            }

            return keep;
        });
    };

    let priceValues = $state([0, 100]);
    let filteredProducts = $derived.by(() => filterProducts(optionSelector, priceValues));
    let count = $derived(filteredProducts.length);
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
                        <Button class="rounded-sm bg-white px-4 py-2 text-black shadow hover:bg-white/90">
                            <Filter strokeWidth={1} class="mr-2" /> Filtrer
                        </Button>
                    {/snippet}
                    {#snippet title()}
                        <h2 class="mx-4 mb-6 mt-3 text-2xl font-bold">Filtrer par</h2>
                    {/snippet}

                    <div class="mx-4 space-y-3">
                        <h2 class="font-bold">Prix</h2>
                        <span>{priceValues[0]}€</span> à <span>{priceValues[1]}€</span>
                        <Slider class="mx-[8px] w-auto" bind:value={priceValues} min={0} max={100} step={5} />
                    </div>

                    {#each allOptions as option (option[0])}
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
                                        checked={optionSelector.get(key)?.has(value) ?? false}
                                        onCheckedChange={(v) => handleCheckbox(key, value, v)}
                                    />
                                    <Label for={`${key}-${value}`}>{value}</Label>
                                </div>
                            {/each}
                        </div>
                    {/each}

                    <div class="mb-8 flex flex-row items-center justify-center">
                        <Button class="mx-4 mt-8 w-32" variant="drezzing" onclick={() => resetOptions(optionSelector)}
                            >Réinitialiser</Button
                        >
                    </div>
                </SidePanel>
                <p class="ml-4">{count} produit{count > 1 ? "s" : ""}</p>
            </div>
        </section>

        <ProductDisplay elements={filteredProducts ?? products} />
    </div>
</div>
