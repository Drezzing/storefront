<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import ProductDisplay from "$lib/components/ProductDisplay.svelte";
    import { ProductFilter, ProductFilterPanel } from "$lib/components/ProductFilter";

    let { data } = $props();
    const { title, products, thumbnail, description } = data;

    const filter = new ProductFilter(products, page.url.searchParams);
    $effect(() => {
        goto("?" + filter.urlSearchParams, { replaceState: true });
    });
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
        <a href="/categories">Catégories</a> /
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
                <ProductFilterPanel {filter} filterType="category" />
                <p class="ml-4">{filter.selectedCount} produit{filter.selectedCount > 1 ? "s" : ""}</p>
            </div>
        </section>

        <ProductDisplay elements={filter.selectedProducts ?? products} />
    </div>
</div>
