import { handleError } from "$lib/error";
import type { StoreProductsRes } from "@medusajs/medusa";

import { medusa } from "$lib/medusa/medusa.js";

export const load = async () => {
    const { product_categories: categories } = await medusa.productCategories
        .list({ parent_category_id: "null" })
        .catch((err) => {
            return handleError(500, "CATEGORIES_LOAD.COLLECTION_LIST_FAILED", { error: err.response.data });
        });

    const frontPageIds = categories.map((categories) => categories.metadata?.["front_page_product"] as string);
    const frontPageProducts = new Map<string, StoreProductsRes["product"]>();
    const { products } = await medusa.products.list({ id: frontPageIds }).catch((err) => {
        return handleError(500, "CATEGORIES_LOAD.COLLECTIONS_LIST_FAILED", { error: err.response.data });
    });
    products.forEach((product) => frontPageProducts.set(product.id!, product));

    const categoryMap = new Map<string, { handle: string; title: string; thumbnail: string }[]>();
    for (const category of categories) {
        categoryMap.set(
            category.name,
            category.category_children.map((childCategory) => {
                const frontPageId = childCategory.metadata?.["front_page_product"] as string;
                const frontPageProduct = frontPageProducts.get(frontPageId);

                if (frontPageProduct === undefined) {
                    return handleError(500, "CATEGORIES_LOAD.FRONT_PAGE_PRODUCT_MISSING", {
                        category: childCategory.id,
                        product: frontPageId,
                        product_id: frontPageId,
                    });
                }

                return {
                    title: childCategory.name,
                    handle: childCategory.handle,
                    thumbnail: frontPageProduct.thumbnail || "https://placehold.co/600",
                };
            }),
        );
    }

    return { categories: categoryMap };
};
