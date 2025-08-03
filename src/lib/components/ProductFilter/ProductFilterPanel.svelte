<script lang="ts">
    import Filter from "@lucide/svelte/icons/filter";

    import SidePanel from "$lib/components/SidePanel.svelte";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { Label } from "$lib/components/ui/label";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { Slider } from "$lib/components/ui/slider";

    import { ProductFilter } from "./productFilter.svelte";
    import type { FilterType } from "./utils";

    let { filter, filterType }: { filter: ProductFilter; filterType: FilterType } = $props();
</script>

<SidePanel>
    {#snippet trigger()}
        <div class="inline-flex items-center rounded-sm bg-white px-4 py-2 text-black shadow hover:bg-white/90">
            <Filter strokeWidth={1} class="mr-2" />
            <p class="text-sm">Filtrer</p>
        </div>
    {/snippet}
    {#snippet title()}
        <h2 class="mx-4 mt-3 mb-6 text-2xl font-bold">Filtrer par</h2>
    {/snippet}

    <div class="mx-4">
        <h2 class="mb-2 font-bold">Prix</h2>
        <span>{filter.selectedPrices[0]}€ à {filter.selectedPrices[1]}€</span>
        <Slider
            class="mt-3 mr-[8px] w-auto"
            bind:value={filter.selectedPrices}
            type="multiple"
            min={0}
            max={100}
            step={5}
        />
    </div>

    {#each filter.getOptions(filterType) as option (option)}
        {@const values = filter.getValues(option)}
        <Separator class="mx-2 my-6 h-[2px] w-auto bg-[#EEEEEE] md:rounded-full" />

        <div class="mx-4 space-y-3">
            <h3 class="font-bold">{option}</h3>

            {#each values || [] as value (value)}
                <div class="flex items-center gap-2">
                    <Checkbox
                        id={`${option}-${value}`}
                        class="data-[state=checked]:bg-d-darkgray"
                        checked={filter.selectedOptions.get(option)?.has(value) ?? false}
                        onCheckedChange={(v) => filter.handleCheckbox(option, value, v)}
                    />
                    <Label for={`${option}-${value}`}>{value}</Label>
                </div>
            {/each}
        </div>
    {/each}

    <div class="mb-8 flex flex-row items-center justify-center">
        <Button class="mx-4 mt-8 w-32" variant="drezzing" onclick={() => filter.resetOptions()}>Réinitialiser</Button>
    </div>
</SidePanel>
