import { ProductFilter } from "$lib/components/ProductFilter/productFilter.svelte";
import type { FilterProducts } from "$lib/components/ProductFilter/utils";
import env from "$lib/env/private";
import { handleError } from "$lib/error";
import { medusa, type MedusaProduct, type MedusaVariant } from "$lib/medusa/medusa";
import { SIZE_MAP } from "$lib/public/products";

export type StoreImage = {
    url: string;
    alt: string;
};

export type StoreVariant = {
    id: string;
    options: Set<{ option: string; value: string }>;
    price: number;
    soldout: boolean;
    images: Array<StoreImage>;
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

/**
 * Transform Medusa products into products suitable for filtering in collections or categories
 * @param products Array of Medusa products
 * @returns Array of products suitable for collections or categories
 */
export const transformProductsForFiltering = (products: MedusaProduct[]): FilterProducts => {
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

/**
 * Get product by its handle
 * @param handle Product handle as defined in medusa admin panel
 * @returns Product details
 */
export const getProductByHandle = async (handle: string) => {
    const products = await medusa.products
        .list({ handle: handle, region_id: env.get("MEDUSA_REGION_ID") })
        .catch((err) => {
            return handleError(500, "GET_PRODUCT_BY_HANDLE.PRODUCT_FETCH_ERROR", {
                ...err.response.data,
                handle: handle,
            });
        });

    if (products.count <= 0) {
        return handleError(404, "GET_PRODUCT_BY_HANDLE.PRODUCT_NOT_FOUND", { handle: handle });
    }
    const product = products.products[0];
    if (product.options === undefined) {
        return handleError(500, "GET_PRODUCT_BY_HANDLE.PRODUCT_OPTIONS_UNAVAILABLE", { handle: handle });
    }

    const optionMap = new Map<string, Array<string>>();

    for (const option of product.options ?? []) {
        const optionValues = new Set<string>();
        for (const value of option.values) {
            optionValues.add(value.value);
        }
        optionMap.set(option.title, Array.from(optionValues).sort());
    }

    const commonImages = new Array<StoreImage>();
    const variantImages = new Map<string, Array<StoreImage>>();

    const imagesVariants = product.metadata?.["imageMetadata-variants"] as Record<string, string[]> | undefined;
    const imageAlts = product.metadata?.["imageMetadata-altDescription"] as Record<string, string> | undefined;

    for (const image of product.images || []) {
        const storeImage: StoreImage = {
            url: image.url,
            alt: imageAlts?.[image.id] || "If you see this, the image is missing an alt description",
        };
        const imageVariants = imagesVariants?.[image.id];
        if (imageVariants && imageVariants.length > 0) {
            for (const variant of imageVariants) {
                if (variantImages.has(variant)) {
                    variantImages.get(variant)?.push(storeImage);
                } else {
                    variantImages.set(variant, [storeImage]);
                }
            }
        } else {
            commonImages.push(storeImage);
        }
    }
    const variantMap = new Array<StoreVariant>();
    for (const variant of product.variants) {
        const variantOptions = new Set(
            variant.options?.map((medusaOption) => {
                return {
                    option: product.options!.find((option) => option.id === medusaOption.option_id)?.title as string,
                    value: medusaOption.value,
                };
            }),
        );
        variantMap.push({
            id: variant.id!,
            options: variantOptions,
            price: variant.original_price || 0.42,
            soldout: isVariantSoldout(variant),
            images: variantImages.get(variant.id!) || [],
        });
    }

    return {
        title: product.title || "Placeholder title",
        description: product.description || "Placeholder description blabla",
        thumbnail: product.thumbnail || "",
        commonImages: commonImages,
        collection: product.collection || {
            handle: "placeholder",
            title: "Placeholder",
            metadata: {} as Record<string, unknown>,
        },
        options: optionMap,
        variants: variantMap,
    };
};
