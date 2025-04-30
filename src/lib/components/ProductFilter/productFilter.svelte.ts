import type { FilterProducts } from "$lib/components/ProductFilter/utils";
import { SIZE_MAP } from "$lib/medusa/product";
import { SvelteMap, SvelteSet } from "svelte/reactivity";

export class ProductFilter {
    private products: FilterProducts;

    public options = new Map<string, string[]>();
    public selectedProducts = $derived.by(() => this.filterProducts());
    public selectedOptions = new SvelteMap<string, SvelteSet<string>>();
    public selectedPrices = $state([0, 100]);

    constructor(products: FilterProducts) {
        this.products = products;

        this.generateOptions();

        for (const [key] of this.options) {
            this.selectedOptions.set(key, new SvelteSet());
        }
    }

    public handleCheckbox(key: string, value: string, v: boolean | "indeterminate") {
        if (v === "indeterminate") return;

        if (v === false) {
            this.selectedOptions.get(key)?.delete(value);
        } else {
            this.selectedOptions.get(key)?.add(value);
        }
    }

    public resetOptions() {
        for (const [key] of this.selectedOptions) {
            this.selectedOptions.get(key)?.clear();
        }
        this.selectedPrices = [0, 100];
    }

    private generateOptions() {
        const allOptions = new Map<string, Set<string>>();
        for (const product of this.products) {
            for (const [key, values] of product.options) {
                if (allOptions.has(key)) {
                    values.forEach((value) => allOptions.get(key)?.add(value));
                } else {
                    allOptions.set(key, new Set(values));
                }
            }
        }
        for (const [key, values] of allOptions) {
            this.options.set(key, Array.from(values));
        }
        if (this.options.has("Taille")) {
            this.options.get("Taille")?.sort((a, b) => SIZE_MAP[a] - SIZE_MAP[b]);
        }
    }

    private filterProducts() {
        return this.products.filter((product) => {
            let keep = true;
            for (const [key, values] of this.selectedOptions) {
                // this option has no value selected, ignoring
                if (values.size == 0) continue;

                // this product does not have this option
                if (product.options.get(key) === undefined) {
                    keep = false;
                    break;
                }
                // the requested options are not on product
                // TODO: this set should not be re-created every time
                if (new Set(product.options.get(key)).intersection(this.selectedOptions.get(key)!).size === 0) {
                    keep = false;
                    break;
                }
            }

            if (keep) {
                keep = false;

                // keeping the product if one of its variant is in price range
                const [priceMin, priceMax] = this.selectedPrices;
                for (const price of product.prices) {
                    if (price === null) continue;

                    // one price is valid, we keep the product so we don't need to check the other prices
                    const priceDec = price / 100;
                    if (priceDec >= priceMin && priceDec <= priceMax) {
                        keep = true;
                        break;
                    }
                }
            }

            return keep;
        });
    }
}
