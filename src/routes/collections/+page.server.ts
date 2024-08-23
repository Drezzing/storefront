import { medusa } from "$lib/medusa/medusa";
import type { StoreProductsRes } from "@medusajs/medusa";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const { collections } = await medusa.collections.list();

    // List all of the front page products
    const frontPageIds = collections.map((collections) => collections.metadata?.["front_page_product"] as string);

    const frontPageProducts = new Map<string, StoreProductsRes["product"]>();
    try {
        // TODO: handle pagination
        // Get product from previous list and map them with id for faster lookup
        const { products } = await medusa.products.list({ id: frontPageIds });
        products.forEach((product) => frontPageProducts.set(product.id!, product));
    } catch (e) {
        console.error(e);
    }

    return {
        collections: collections.map((collection) => {
            const frontPageId = collection.metadata?.["front_page_product"] as string;
            const frontPageProduct = frontPageProducts.get(frontPageId);

            if (frontPageProduct === undefined) {
                console.error(`Failed to retrieve product ${frontPageId} for collection ${collection.id}`);
            }

            return {
                id: collection.id,
                title: collection.title,
                handle: collection.handle,
                thumbnail: frontPageProduct?.thumbnail || "https://via.placeholder.com/600x600", // Récupérer le thumbnail du produit
            };
        }),
    };
};
