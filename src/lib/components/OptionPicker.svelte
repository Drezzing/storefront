<script lang="ts">
    import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
    let { choices, value = $bindable() }: {choices: string[], value: string} = $props()

    value = choices[0]
</script>

<ToggleGroup.Root type="single" bind:value={value} class="justify-start gap-4">
    {#each choices as choice}
        <ToggleGroup.Item value={choice} class="ring-1 bg-transparent ring-black data-[state=on]:ring-2 data-[state=on]:bg-gray-200 hover:bg-gray-200 hover:text-black">
            {choice.slice(0, 1).toUpperCase() + choice.slice(1).toLowerCase()}
        </ToggleGroup.Item>
    {/each}
</ToggleGroup.Root>