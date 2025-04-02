<script lang="ts">
    import ProductDisplay from "$lib/components/ProductDisplay.svelte";

    let { data } = $props();
    let { collections } = data;
</script>

<svelte:head>
    <title>Collections</title>
    <meta property="og:title" content="Collections" />
    <meta name="description" content="Explorez toutes les collections disponibles." />
    <meta property="og:description" content="Explorez toutes les collections disponibles." />
</svelte:head>

<div class="max-w-[1024px] justify-center px-4 md:px-8 lg:m-auto lg:space-y-16">
    <section class="justify-center space-y-8 text-center">
        <h2 class="mb-8 text-3xl font-bold lg:mb-16">Collections</h2>
        <ProductDisplay elements={collections} route="collection" />
    </section>
</div>
