<script lang="ts">
    import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
    let { choices, value = $bindable() }: {choices: string[], value: string} = $props()

    value = choices[0]
</script>

<ToggleGroup.Root type="single" bind:value={value}>
    {#each choices as choice}
        <ToggleGroup.Item value={choice}>{choice.slice(0, 1).toUpperCase() + choice.slice(1).toLowerCase()}</ToggleGroup.Item>
    {/each}
</ToggleGroup.Root>