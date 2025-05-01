import { SvelteMap, SvelteSet } from "svelte/reactivity";

import type { FilterProducts, FilterType } from "$lib/components/ProductFilter";
import { SIZE_MAP } from "$lib/medusa/product";

export class ProductFilter {
    private products: FilterProducts;
    private productsOptions = new Map<string, Map<string, Set<string>>>();

    private options = new Map<string, string[]>();
    public selectedProducts = $derived.by(() => this.filterProducts());
    public selectedOptions = new SvelteMap<string, SvelteSet<string>>();
    public selectedPrices = $state([0, 100]);
    public selectedCount = $derived(this.selectedProducts.length);

    public urlSeachParams = $derived(this.serializeFilter());

    private readonly MIN_PRICE = 0;
    private readonly MAX_PRICE = 100;

    public static readonly CATEGORY_KEY = "Catégorie";
    public static readonly COLLECTION_KEY = "Collection";

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

    public getOptions(type: FilterType) {
        let keys = Array.from(this.options.keys());
        if (type === "collection") {
            keys = keys.filter((key) => key !== ProductFilter.COLLECTION_KEY);
        } else if (type === "category") {
            keys = keys.filter((key) => key !== ProductFilter.CATEGORY_KEY);
        }

        return keys.sort();
    }

    public getValues(key: string) {
        return this.options.get(key);
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
            this.productsOptions.set(product.handle, new Map());
            for (const [key, values] of product.options) {
                if (allOptions.has(key)) {
                    values.forEach((value) => allOptions.get(key)?.add(value));
                } else {
                    allOptions.set(key, new Set(values));
                }
                this.productsOptions.get(product.handle)?.set(key, new Set(values));
            }
        }
        console.log(allOptions);
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
            const productOptions = this.productsOptions.get(product.handle);
            for (const [key, values] of this.selectedOptions) {
                // this option has no value selected, ignoring
                if (values.size == 0) continue;

                // this product does not have any options
                if (productOptions === undefined || productOptions.size === 0) {
                    keep = false;
                    break;
                }
                // this product does not have this option
                if (productOptions.get(key) === undefined || productOptions.get(key)!.size === 0) {
                    keep = false;
                    break;
                }
                // the requested options are not on product
                if (productOptions.get(key)!.intersection(this.selectedOptions.get(key)!).size === 0) {
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
