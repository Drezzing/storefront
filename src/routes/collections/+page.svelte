<script lang="ts">
    let { data } = $props();
    let { collections } = data;
</script>

<svelte:head>
    <title>Collections</title>
    <meta name="description" content="Collections page" />
</svelte:head>

<div class="max-w-[1024px] justify-center md:px-8 lg:m-auto lg:space-y-16">
    <section class="justify-center space-y-8 text-center">
        <h2 class="text-3xl font-bold">Collections</h2>
        <div class="grid grid-cols-2 items-center justify-center gap-6 px-4 md:grid-cols-3 lg:grid-cols-4">
            {#each collections as collection}
                <a href={`/collection/${collection?.handle}`} class="space-y-4">
                    <img src={collection.thumbnail} alt={collection.title} class="rounded-full" />
                    <p>{collection.title}</p>
                </a>
            {/each}
        </div>
    </section>
</div>
