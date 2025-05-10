import env from "$lib/env/private";
import { handleError } from "$lib/error.js";
import { medusa } from "$lib/medusa/medusa";
import { isVariantSoldout } from "$lib/medusa/product";

export const prerender = false;

type StoreImage = {
    url: string;
    alt: string;
};

type StoreVariant = {
    id: string;
    options: Set<string>;
    price: number;
    soldout: boolean;
    images: Array<StoreImage>;
};

export const load = async ({ params }) => {
    const products = await medusa.products
        .list({ handle: params.id, region_id: env.get("MEDUSA_REGION_ID") })
        .catch((err) => {
            return handleError(500, "PRODUCT_LOAD.PRODUCTS_LIST_FAILED", { err: err.response.data });
        });

    if (products.count <= 0) {
        return handleError(404, "PRODUCT_LOAD.PRODUCT_NOT_FOUND");
    }
    const product = products.products[0];

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
        const variantOptions = new Set<string>(variant.options?.map((option) => option.value));
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
        collection: product.collection || { handle: "placeholder", title: "Placeholder" },
        options: optionMap,
        variants: variantMap,
    };
};
