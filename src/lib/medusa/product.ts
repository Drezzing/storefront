import { type MedusaProduct, type MedusaVariant } from "$lib/medusa/medusa";
import { type FilterOptions, type FilterData } from "$lib/components/ProductFilter/utils";

export const SIZE_MAP: Record<string, number> = {
    xs: 1,
    s: 2,
    m: 3,
    l: 4,
    xl: 5,
    xxl: 6,
    "3xl": 7,
};

export const isVariantSoldout = (variant: MedusaVariant) => {
    return Boolean(variant.manage_inventory) && (variant.inventory_quantity || 0) <= 0;
};

export const getProductOptions = (product: MedusaProduct) => {
    const optionMap = new Map<string, string[]>();

    for (const option of product.options ?? []) {
        const optionValues = new Set<string>();
        for (const value of option.values) {
            optionValues.add(value.value);
        }
        optionMap.set(option.title, Array.from(optionValues));
    }

    if (optionMap.has("Taille")) {
        optionMap.get("Taille")?.sort((a, b) => SIZE_MAP[a] - SIZE_MAP[b]);
    }

    return optionMap;
};

export const getAllOptions = (products: MedusaProduct[]): FilterOptions => {
    const allOptions = new Map<string, Set<string>>();
    for (const product of products) {
        for (const [key, values] of getProductOptions(product)) {
            if (allOptions.has(key)) {
                values.forEach((value) => allOptions.get(key)?.add(value));
            } else {
                allOptions.set(key, new Set(values));
            }
        }
    }

    return allOptions;
};

export const getFilterData = (medusaProducts: MedusaProduct[]): FilterData => {
    const allOptions = getAllOptions(medusaProducts);
    const products = medusaProducts.map((product) => {
        const options = getProductOptions(product);
        const prices = new Set(product.variants.map((variant) => variant.original_price));

        return {
            title: product.title!,
            handle: product.handle!,
            thumbnail: product.thumbnail || "https://placehold.co/600",
            options,
            prices,
        };
    });

    return { products, allOptions };
};
