import { medusa } from "$lib/medusa/medusa";
import { env } from "$env/dynamic/private";
import { handleError } from "$lib/error.js";
import { isVariantSoldout } from "$lib/medusa/product";

export const prerender = false;

type StoreVariant = {
    id: string;
    options: Set<string>;
    price: number;
    soldout: boolean;
    images: Array<string>;
};

export const load = async ({ params }) => {
    const products = await medusa.products.list({ handle: params.id, region_id: env.MEDUSA_REGION_ID }).catch((err) => {
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

    const commonImages = new Array<string>();
    const variantImages = new Map<string, Array<string>>();
    for (const image of product.images || []) {
        if (!image.metadata) {
            commonImages.push(image.url);
            continue;
        }
        if (!image.metadata.variants) {
            commonImages.push(image.url);
        } else {
            const variants = image.metadata.variants as string[];
            for (const variant of variants) {
                if (variantImages.has(variant)) {
                    // @ts-expect-error has check right before, ts being dumb
                    variantImages.get(variant).push(image.url);
                } else {
                    variantImages.set(variant, [image.url]);
                }
            }
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
