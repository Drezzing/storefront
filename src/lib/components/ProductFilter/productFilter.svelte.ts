import { SvelteMap, SvelteSet } from "svelte/reactivity";

import type { FilterProducts } from "$lib/components/ProductFilter/utils";
import { SIZE_MAP } from "$lib/medusa/product";

export class ProductFilter {
    private products: FilterProducts;

    public options = new Map<string, string[]>();
    public selectedProducts = $derived.by(() => this.filterProducts());
    public selectedOptions = new SvelteMap<string, SvelteSet<string>>();
    public selectedPrices = $state([0, 100]);
    public selectedCount = $derived(this.selectedProducts.length);

    public urlSeachParams = $derived(this.serializeFilter());

    private readonly MIN_PRICE = 0;
    private readonly MAX_PRICE = 100;

    constructor(products: FilterProducts, searchParams?: URLSearchParams) {
        this.products = products;

        this.generateOptions();

        for (const [key] of this.options) {
            this.selectedOptions.set(key, new SvelteSet());
        }

        if (searchParams) {
            this.deserializeFilter(searchParams);
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
        this.selectedPrices = [this.MIN_PRICE, this.MAX_PRICE];
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

    private serializeFilter() {
        const searchParams = new URLSearchParams();
        for (const [key, values] of this.selectedOptions) {
            for (const value of values) {
                searchParams.append(key, value);
            }
        }
        if (this.selectedPrices[0] !== this.MIN_PRICE) {
            searchParams.set("priceMin", this.selectedPrices[0].toString());
        }
        if (this.selectedPrices[1] !== this.MAX_PRICE) {
            searchParams.set("priceMax", this.selectedPrices[1].toString());
        }

        return searchParams.toString();
    }

    private deserializeFilter(searchParams: URLSearchParams) {
        const parseNumber = (value: string): { data: null; success: false } | { data: number; success: true } => {
            const isValid = RegExp(/^\d+$/).test(value);
            if (!isValid) {
                return { data: null, success: false };
            }

            const number = parseInt(value, 10);
            if (number < this.MIN_PRICE) {
                return { data: null, success: false };
            }
            if (number > this.MAX_PRICE) {
                return { data: null, success: false };
            }
            return { data: number, success: true };
        };

        for (const [key, value] of searchParams.entries()) {
            if (key === "priceMin") {
                const { data, success } = parseNumber(value);
                if (!success) {
                    console.error("priceMax must be a number greater than or equal to", this.MIN_PRICE);
                }
                this.selectedPrices[0] = success ? data : this.MIN_PRICE;
            } else if (key === "priceMax") {
                const { data, success } = parseNumber(value);
                if (!success) {
                    console.error("priceMax must be a number less than or equal to", this.MAX_PRICE);
                }
                this.selectedPrices[1] = success ? data : this.MAX_PRICE;
            } else {
                if (this.options.get(key)?.includes(value)) {
                    this.selectedOptions.get(key)?.add(value);
                } else {
                    console.error(`Key "${key}" with value "${value}" is not valid and will be ignored`);
                }
            }
        }
    }
}
