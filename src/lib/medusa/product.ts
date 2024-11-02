import type { StoreProductsRes, StoreVariantsRes } from "@medusajs/medusa";

export const SIZE_MAP: Record<string, number> = {
    xs: 1,
    s: 2,
    m: 3,
    l: 4,
    xl: 5,
};

export const getProductOptions = (product: StoreProductsRes["product"]) => {
    const optionMap = new Map<string, string[]>();

    for (const option of product.options ?? []) {
        const optionValues = new Set<string>();
        for (const value of option.values) {
            optionValues.add(value.value);
        }
        optionMap.set(option.title, Array.from(optionValues));
    }

    if (optionMap.has("taille")) {
        optionMap.get("taille")?.sort((a, b) => SIZE_MAP[a] - SIZE_MAP[b]);
    }

    return optionMap;
};

export const isVariantSoldout = (variant: StoreVariantsRes["variant"]) => {
    return Boolean(variant.manage_inventory) && (variant.inventory_quantity || 0) <= 0;
};
