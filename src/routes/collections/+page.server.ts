import { medusa } from "$lib/medusa/medusa";
import type { StoreProductsRes } from "@medusajs/medusa";
import type { PageServerLoad } from "./$types";
import { handleError } from "$lib/error";

export const load: PageServerLoad = async () => {
    const { collections } = await medusa.collections.list().catch((err) => {
        return handleError(500, "COLLECTIONS_LOAD.COLLECTIONS_LIST_FAILED", { error: err.response.data });
    });

    // List all of the front page products
    const frontPageIds = collections.map((collections) => collections.metadata?.["front_page_product"] as string);

    const frontPageProducts = new Map<string, StoreProductsRes["product"]>();

    // TODO: handle pagination
    const { products } = await medusa.products.list({ id: frontPageIds }).catch((err) => {
        return handleError(500, "COLLECTIONS_LOAD.COLLECTIONS_LIST_FAILED", { error: err.response.data });
    });
    products.forEach((product) => frontPageProducts.set(product.id!, product));

    return {
        collections: collections.map((collection) => {
            const frontPageId = collection.metadata?.["front_page_product"] as string;
            const frontPageProduct = frontPageProducts.get(frontPageId);

            if (frontPageProduct === undefined) {
                console.error(`Failed to retrieve product ${frontPageId} for collection ${collection.id}`);
            }

            return {
                title: collection.title,
                handle: collection.handle,
                thumbnail: frontPageProduct?.thumbnail || "https://via.placeholder.com/600x600",
            };
        }),
    };
};
