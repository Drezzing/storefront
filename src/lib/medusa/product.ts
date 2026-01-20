import { ProductFilter } from "$lib/components/ProductFilter/productFilter.svelte";
import type { FilterProducts } from "$lib/components/ProductFilter/utils";
import { handleError } from "$lib/error";
import { medusa, type MedusaProduct, type MedusaVariant } from "$lib/medusa/medusa";
import { SIZE_MAP } from "$lib/public/products";

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

export const getProducts = (products: MedusaProduct[]): FilterProducts => {
    return products.map((product) => {
        const options = getProductOptions(product);
        const prices = new Set(product.variants.map((variant) => variant.original_price));

        const category = product.type?.value || null; // category not expanded by default by medusa, so using product type
        const collection = product.collection?.title || null;

        if (category) {
            options.set(ProductFilter.CATEGORY_KEY, [category]);
        }

        if (collection) {
            options.set(ProductFilter.COLLECTION_KEY, [collection]);
        }

        return {
            title: product.title!,
            handle: product.handle!,
            thumbnail: product.thumbnail || "https://placehold.co/600",
            options,
            prices,
        };
    });
};

/**
 * Get the most recent products
 * @param limit Number of products to retrieve
 * @returns Array of recent products
 */
export const getRecentProducts = async (limit: number) => {
    const recentProducts = await medusa.products.list({ order: "-created_at", limit });
    if (recentProducts.count <= 0) {
        return handleError(404, "GET_RECENT_PRODUCTS.PRODUCTS_NOT_FOUND");
    }

    return recentProducts.products.map((product) => ({
        title: product.title ?? "",
        handle: product.handle ?? "",
        thumbnail: product.thumbnail ?? "https://placehold.co/600",
    }));
};
