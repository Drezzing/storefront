<script lang="ts">
    import * as RadioGroup from "$lib/components/ui/radio-group/index.js";

    let { choices, value = $bindable() }: { choices: string[]; value: string } = $props();

    value = choices[0];

    const choiceToCSS: Record<string, string> = {
        bleu: "blue-600",
        blanc: "white",
    };
</script>

<RadioGroup.Root bind:value orientation="horizontal">
    {#each choices as choice (choice)}
        <RadioGroup.Item
            value={choice}
            id={choice}
            class="border-dgray text-{choiceToCSS[choice]} m-0 ring-1 checked:ring-4"
        />
    {/each}
</RadioGroup.Root>
