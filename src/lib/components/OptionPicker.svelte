<script lang="ts">
    import * as RadioGroup from "$lib/components/ui/radio-group";
    import { Label } from "$lib/components/ui/label";

    let { choices, value = $bindable() }: { choices: Array<string>; value: string } = $props();
</script>

<RadioGroup.Root class="flex flex-row flex-wrap justify-start gap-4" bind:value>
    {#each choices as choice (choice)}
        <RadioGroup.Item id={choice} value={choice} class="hidden">
            {choice}
        </RadioGroup.Item>
        <Label
            class="cursor-pointer rounded-md bg-transparent px-4 py-3 text-center ring-1 ring-black transition-colors hover:bg-d-darkgray hover:text-white {choice ===
            value
                ? 'bg-d-darkgray text-white'
                : 'bg-transparent ring-1'}"
            for={choice}>{choice}</Label
        >
    {/each}
</RadioGroup.Root>
