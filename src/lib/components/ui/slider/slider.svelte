<script lang="ts">
    import { Slider as SliderPrimitive } from "bits-ui";
    import { cn } from "$lib/utils.js";

    type $$Props = SliderPrimitive.Props;

    let className: $$Props["class"] = undefined;
    export let value: $$Props["value"] = [0];
    export { className as class };
</script>

<SliderPrimitive.Root
    bind:value
    class={cn("relative flex w-full touch-none select-none items-center", className)}
    {...$$restProps}
    let:thumbs
>
    <span class="relative h-1 w-full grow overflow-hidden rounded-full bg-dgray">
        <SliderPrimitive.Range class="absolute h-full bg-[#2C2C2C]" />
    </span>
    {#each thumbs as thumb}
        <SliderPrimitive.Thumb
            {thumb}
            class="block size-3 rounded-full border-2 border-[#2C2C2C] bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />
    {/each}
</SliderPrimitive.Root>
