<script lang="ts">
    import ProductDisplay from "$lib/components/ProductDisplay.svelte";

    let { data } = $props();
</script>

<svelte:head>
    <title>Catégories</title>
    <meta property="og:title" content="Catégories" />
    <meta name="description" content="Explorez toutes les catégories disponibles." />
    <meta property="og:description" content="Explorez toutes les catégories disponibles." />
</svelte:head>

<div class="max-w-[1024px] justify-center px-4 md:px-8 lg:m-auto">
    <h1 class="mb-8 text-center text-3xl font-bold">Catégories</h1>

    {#each data.categories as category (category[0])}
        {@const name = category[0]}
        {@const childCategories = category[1]}
        <div class="mb-8 md:mb-12 lg:mb-16">
            <h2 class="mb-4 text-xl font-semibold md:mb-6 lg:mb-8">{name}</h2>
            <ProductDisplay elements={childCategories} route="category" />
        </div>
    {/each}
</div>
