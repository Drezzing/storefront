<script lang="ts">
    let {
        elements,
        route = "products",
        limitNumber = false,
    }: {
        elements: { handle: string; thumbnail: string; title: string }[];
        route?: string;
        limitNumber?: boolean;
    } = $props();

    const getVisibility = (i: number) => {
        let visibility = "";
        if (i > 4 && i <= 6) {
            visibility = "hidden sm:block";
        } else if (i > 6 && i <= 8) {
            visibility = "hidden lg:block";
        }

        return visibility;
    };
</script>

<div class="grid grid-cols-2 items-center justify-center gap-6 sm:grid-cols-3 lg:grid-cols-4">
    {#each elements as element, i}
        <a href="/{route}/{element.handle}" class="space-y-2 rounded-lg {limitNumber ? getVisibility(i) : ''}">
            <img src={element.thumbnail} alt={element.title} class="aspect-square size-full" />
            <p class="pb-2 text-center">{element.title}</p>
        </a>
    {/each}
</div>
