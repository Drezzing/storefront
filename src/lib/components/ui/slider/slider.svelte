<script lang="ts">
    import { Slider as SliderPrimitive, type WithoutChildrenOrChild } from "bits-ui";
    import { cn } from "$lib/utils.js";

    let {
        ref = $bindable(null),
        value = $bindable(),
        orientation = "horizontal",
        class: className,
        ...restProps
    }: WithoutChildrenOrChild<SliderPrimitive.RootProps> = $props();
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<SliderPrimitive.Root
    bind:ref
    bind:value={value as never}
    {orientation}
    class={cn(
        "relative flex touch-none select-none items-center data-[orientation='vertical']:h-full data-[orientation='vertical']:min-h-44 data-[orientation='horizontal']:w-full data-[orientation='vertical']:w-auto data-[orientation='vertical']:flex-col",
        className,
    )}
    {...restProps}
>
    {#snippet children({ thumbs })}
        <span
            data-orientation={orientation}
            class="relative grow overflow-hidden rounded-full bg-secondary data-[orientation='horizontal']:h-1.5 data-[orientation='vertical']:h-full data-[orientation='horizontal']:w-full data-[orientation='vertical']:w-1.5 md:data-[orientation='horizontal']:h-1 md:data-[orientation='vertical']:w-1"
        >
            <SliderPrimitive.Range
                class="absolute bg-primary data-[orientation='horizontal']:h-full data-[orientation='vertical']:w-full"
            />
        </span>
        {#each thumbs as thumb (thumb)}
            <SliderPrimitive.Thumb
                index={thumb}
                class="block size-4 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 md:size-3"
            />
        {/each}
    {/snippet}
</SliderPrimitive.Root>
