<script lang="ts">
    import { Label } from "$lib/components/ui/label";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { Slider } from "$lib/components/ui/slider";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { X, Filter } from "lucide-svelte";
    import { fly } from "svelte/transition";

    import { SvelteMap, SvelteSet } from "svelte/reactivity";

    let { data } = $props();
    const { title, products, thumbnail, description, allOptions } = data;

    let optionSelector = $state(new SvelteMap<string, SvelteSet<string>>());
    for (const [key, _] of allOptions) {
        optionSelector.set(key, new SvelteSet<string>());
    }

    const resetOptions = (options: SvelteMap<string, SvelteSet<string>>) => {
        for (const [key, _] of options) {
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

    let menufilter = $state(false);
    let priceValues = $state([0, 100]);
    let filteredProducts = $derived.by(() => filterProducts(optionSelector, priceValues));
    let count = $derived(filteredProducts.length);
</script>

<svelte:head>
    <title>{title}</title>
    <meta name="description" content="Collection {title}" />
</svelte:head>

{#if menufilter}
    <div
        class="fixed left-0 top-0 h-screen w-[200px] bg-white shadow md:w-[300px]"
        transition:fly={{ x: -250, duration: 350 }}
    >
        <button
            class="hover:bg-dgray ml-3 mt-3 flex size-[32px] items-center justify-center rounded-full transition-colors duration-100 ease-in-out"
            onclick={() => (menufilter = !menufilter)}
        >
            <X class="text-d-darkgray" />
        </button>

        <h2 class="mx-3 mb-6 mt-3 text-2xl font-bold">Filtrer par</h2>

        <div class="mx-4 space-y-3">
            <h2 class="font-bold">Prix</h2>
            <span>{priceValues[0]}€</span> à <span>{priceValues[1]}€</span>
            <Slider class="mx-[8px] w-auto" bind:value={priceValues} min={0} max={100} step={5} />
        </div>

        {#each allOptions as option}
            {@const key = option[0]}
            {@const values = option[1]}
            <Separator class="mx-2 my-6 h-[2px] w-auto bg-[#EEEEEE] md:rounded-full" />

            <div class="mx-4 space-y-3">
                <h3 class="font-bold">{key}</h3>

                {#each values as value}
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

        <div class="flex flex-row items-center justify-center">
            <Button class="mx-4 mt-8 w-32" variant="drezzing" onclick={() => resetOptions(optionSelector)}
                >Réinitialiser</Button
            >
        </div>
    </div>
{/if}

<div class="mx-4 max-w-[1024px] md:px-8 lg:m-auto">
    <div>
        <a href="/collections">Collections</a> /
        <span class="font-bold">{title}</span>
    </div>

    <section class="my-12 space-y-2 text-center">
        <h1 class="text-4xl font-bold">{title}</h1>
        <p>{description}</p>
    </section>

    <div class="space-y-4">
        <a href="/cgv" class="underline">Conditions particulière de vente</a>

        <section class="-mx-4 bg-[#EEEEEE] px-4 py-2">
            <div class="flex items-center justify-between">
                <Button
                    class="rounded-sm bg-white px-4 py-2 text-black shadow hover:bg-white/90"
                    onclick={() => (menufilter = !menufilter)}
                >
                    <Filter strokeWidth={1} class="mr-2" /> Filtrer
                </Button>
                <p class="ml-4">{count} produit{count > 1 ? "s" : ""}</p>
            </div>
        </section>

        <section class="grid grid-cols-2 items-center justify-center gap-6 md:grid-cols-3 lg:grid-cols-4">
            {#each filteredProducts ?? products as product}
                <a href={`/products/${product.handle}`} class="space-y-2">
                    <img src={product.thumbnail} alt={product.title} />
                    <p class="text-center">{product.title}</p>
                </a>
            {/each}
        </section>
    </div>
</div>
