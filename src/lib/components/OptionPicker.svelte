<script lang="ts">
    import * as RadioGroup from "$lib/components/ui/radio-group";
    import { Label } from "$lib/components/ui/label";
    import { cn } from "$lib/utils";

    let {
        choices,
        value = $bindable(),
    }: {
        choices: {
            value: string;
            disabled: boolean;
        }[];
        value: string;
    } = $props();
</script>

<RadioGroup.Root class="flex flex-row flex-wrap justify-start gap-4" bind:value>
    {#each choices as choice (choice.value)}
        <RadioGroup.Item id={choice.value} value={choice.value} class="hidden" disabled={choice.disabled} />
        <Label
            aria-disabled={choice.disabled}
            class={cn(
                "hover:bg-d-darkgray cursor-pointer rounded-md bg-transparent px-4 py-3 text-center ring-1 ring-black transition-colors hover:text-white",
                choice.value === value && !choice.disabled ? "bg-d-darkgray text-white" : "bg-transparent ring-1",
                "aria-disabled:cursor-auto aria-disabled:text-gray-500 aria-disabled:ring-gray-400 aria-disabled:hover:bg-white aria-disabled:hover:text-gray-500",
            )}
            for={choice.value}>{choice.value}</Label
        >
    {/each}
</RadioGroup.Root>
