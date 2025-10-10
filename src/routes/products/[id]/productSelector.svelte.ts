import type { StoreVariant } from "$lib/products/products";
import { error } from "@sveltejs/kit";
import { SvelteMap, SvelteSet } from "svelte/reactivity";

export class ProductSelector {
    private options: Map<string, string[]>;
    private variants: StoreVariant[];
    private validVariants: Set<string>;

    public selectedOptions = $state<{ option: string; value: string }[]>([]);
    public selectedVariant = $derived(this.getVariant());
    public availableOptions = $derived(this.getOptionsAvailability(this.selectedVariant));

    constructor(options: Map<string, string[]>, variants: StoreVariant[]) {
        this.variants = variants;

        this.options = options;
        this.variants[0].options.forEach((option) =>
            this.selectedOptions.push({ option: option.option, value: option.value }),
        );

        this.validVariants = new SvelteSet();
        for (const variant of this.variants) {
            const combinationKey = this.createOptionKey(variant.options.values().toArray());
            this.validVariants.add(combinationKey);
        }
    }

    private getVariant() {
        const optionsSet = new SvelteSet(this.selectedOptions.map((option) => option.value));
        const v = this.variants.find((variant) => {
            return (
                variant.options.size === optionsSet.size &&
                [...variant.options].every((variantOption) => optionsSet.has(variantOption.value))
            );
        });

        if (v === undefined) error(500);
        return v;
    }

    // for each subarray of n-1 options, depending on the current values of the subarray, we check if it is possible to
    // select every value of the last option. If the variant does not exist, we disable the option.
    // We do this for every possible subarray.
    private getOptionsAvailability(selectedVariant: StoreVariant) {
        const availableOptions = new SvelteMap<string, { value: string; disabled: boolean }[]>();

        this.options.forEach((values, key) => {
            availableOptions.set(
                key,
                values.map((choice) => ({ value: choice, disabled: false })),
            );
        });

        const variantOptions = selectedVariant.options.values().toArray();

        for (let i = 0; i < variantOptions.length; i++) {
            const currentOption = variantOptions[i];
            const otherOptions = variantOptions.filter((_, index) => index !== i);

            const optionChoices = availableOptions.get(currentOption.option)!;
            for (const choice of optionChoices) {
                const testCombination = [...otherOptions, { option: currentOption.option, value: choice.value }];
                const testKey = this.createOptionKey(testCombination);
                choice.disabled = !this.validVariants.has(testKey);
            }
        }

        return availableOptions;
    }

    private createOptionKey(options: { option: string; value: string }[]): string {
        return options
            .sort((a, b) => a.option.localeCompare(b.option))
            .map((opt) => `${opt.option}:${opt.value}`)
            .join("|");
    }
}
