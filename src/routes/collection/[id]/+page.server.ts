import { medusa } from "$lib/medusa/medusa";
import { getProductOptions } from "$lib/medusa/product";
import type { PageServerLoad } from "./$types";
import { PUBLIC_REGION_ID } from "$env/static/public";
import { handleError } from "$lib/error";
import { isCollectionPrivate } from "$lib/medusa/collection";

export const prerender = false;

export const load: PageServerLoad = async ({ params }) => {
    const collections = await medusa.collections.list({ handle: [params.id] }).catch((err) => {
        return handleError(500, "COLLECTION_LOAD.COLLECTION_LIST_FAILED", { err: err.response.data });
    });

    if (collections.count <= 0) {
        return handleError(404, "COLLECTION_LOAD.COLLECTION_NOT_FOUND");
    }

    const collection = collections.collections[0];

    if (isCollectionPrivate(collection)) {
        return handleError(404, "COLLECTION_LOAD.COLLECTION_PRIVATE");
    }

    const { products: medusaProduct } = await medusa.products
        .list({
            collection_id: [collection.id],
            region_id: PUBLIC_REGION_ID,
        })
        .catch((err) => {
            return handleError(500, "COLLECTION_LOAD.PRODUCT_LIST_FAILED", { err: err.response.data });
        });

    const products = medusaProduct.map((product) => {
        return {
            title: product.title || "placeholder",
            handle: product.handle || "placeholder",
            thumbnail: product.thumbnail || "placeholder",
            options: getProductOptions(product),
            prices: new Set(product.variants.map((variant) => variant.original_price)),
        };
    });

    // const frontPageProduct = await medusa.products.retrieve(collection.metadata?.["front_page_product"] as string);
    const description = collection.metadata?.["description"] as string | undefined;
    const cpv = collection.metadata?.["cpv"] as string | undefined;
    const guideTaille = collection.metadata?.["guide-taille"] as string | undefined;

    const allOptions = new Map<string, Set<string>>();
    for (const product of products) {
        for (const [key, values] of product.options) {
            if (allOptions.has(key)) {
                values.forEach((value) => allOptions.get(key)?.add(value));
            } else {
                allOptions.set(key, new Set(values));
            }
        }
    }

    return {
        title: collection.title,
        handle: collection.handle,
        description: description,
        cpv: cpv,
        guideTaille: guideTaille,
        products: products,
        // thumbnail: null,
        // thumbnail: frontPageProduct.product.thumbnail ?? "https://",
        allOptions,
    };
};
