<script lang="ts">
    import * as RadioGroup from "$lib/components/ui/radio-group/index.js";

    let { choices, value = $bindable() }: {choices: string[], value: string} = $props()

    value = choices[0]

    const choiceToCSS: Record<string, string> = {
        "bleu": "blue-600",
        "blanc": "white"
    }

</script>

<RadioGroup.Root bind:value={value} orientation="horizontal" >
    {#each choices as choice}
        <RadioGroup.Item value={choice} id={choice} class="border-dgray text-{choiceToCSS[choice]} ring-1 checked:ring-4 m-0" />
    {/each}
</RadioGroup.Root>