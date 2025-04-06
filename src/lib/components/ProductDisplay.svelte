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
            visibility = "hidden md:block";
        }

        return visibility;
    };
</script>

<div class="grid grid-cols-2 items-center justify-center gap-6 sm:grid-cols-3 md:grid-cols-4 lg:gap-8">
    {#each elements as element, i (element.handle)}
        <a href="/{route}/{element.handle}" class="space-y-2 rounded-lg {limitNumber ? getVisibility(i + 1) : ''}">
            <img src={element.thumbnail} alt={element.title} class="aspect-square size-full object-contain" />
            <p class="pb-2 text-center">{element.title}</p>
        </a>
    {/each}
</div>
