import { medusa } from "$lib/medusa/medusa";
import { getProductOptions } from "$lib/medusa/product";
import type { PageServerLoad } from "./$types";
import { PUBLIC_REGION_ID } from "$env/static/public";

export const load: PageServerLoad = async ({ params }) => {
    const collections = await medusa.collections.list({ handle: [params.id] });
    const collection = collections.collections[0];

    const { products: medusaProduct } = await medusa.products.list({
        collection_id: [collection.id],
        region_id: PUBLIC_REGION_ID,
    });

    const products = medusaProduct.map((product) => {
        return {
            title: product.title,
            handle: product.handle,
            thumbnail: product.thumbnail,
            options: getProductOptions(product),
            prices: new Set(product.variants.map((variant) => variant.original_price)),
        };
    });

    const frontPageProduct = await medusa.products.retrieve(collection.metadata?.["front_page_product"] as string);
    const description = collection.metadata?.["description"] as string | undefined;

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
        products: products,
        thumbnail: frontPageProduct.product.thumbnail ?? "https://",
        allOptions,
    };
};
