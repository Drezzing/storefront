import { handleError } from "$lib/error";
import { isCollectionPrivate } from "$lib/medusa/collection";
import { medusa } from "$lib/medusa/medusa";
import type { StoreProductsRes } from "@medusajs/medusa";

export const prerender = false;

export const load = async () => {
    const [products, collectionsResponse] = await Promise.all([
        medusa.products.list({ order: "-created_at", limit: 8 }),
        medusa.collections.list(), // can't order so limit is useless :)
    ]);

    if (products.count <= 0) {
        return handleError(404, "HOMEPAGE_LOAD.PRODUCTS_NOT_FOUND");
    }

    if (collectionsResponse.count <= 0) {
        return handleError(404, "HOMEPAGE_LOAD.COLLECTIONS_NOT_FOUND");
    }

    const collections = collectionsResponse.collections.filter((collection) => !isCollectionPrivate(collection));

    const frontPageIds = collections.map((collections) => collections.metadata?.["front_page_product"] as string);
    const frontPageProducts = new Map<string, StoreProductsRes["product"]>();

    const { products: collectionProducts } = await medusa.products.list({ id: frontPageIds }).catch((err) => {
        return handleError(500, "HOMEPAGE_LOAD.COLLECTIONS_LIST_FAILED", { error: err.response.data });
    });
    collectionProducts.forEach((product) => frontPageProducts.set(product.id!, product));

    return {
        products: products.products.map((product) => {
            return {
                title: product.title ?? "",
                handle: product.handle ?? "",
                thumbnail: product.thumbnail ?? "",
            };
        }),
        collections: collections
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((collection) => {
                const frontPageId = collection.metadata?.["front_page_product"] as string;
                const frontPageProduct = frontPageProducts.get(frontPageId);

                if (frontPageProduct === undefined) {
                    return handleError(500, "HOMEPAGE_LOAD.FRONT_PAGE_PRODUCT_MISSING", {
                        category: collection.id,
                        product: frontPageId,
                    });
                }
                return {
                    title: collection.title,
                    handle: collection.handle,
                    thumbnail: frontPageProduct?.thumbnail || "https://placehold.co/600",
                };
            })
            .slice(0, 8),
    };
};
