import env from "$lib/env/private";
import { handleError } from "$lib/error";
import { medusa } from "$lib/medusa/medusa";
import { transformProductsForFiltering } from "$lib/medusa/product";
import { getThumbnail } from "$lib/medusa/utils";

/**
 * Get all the public categories with their child categories
 * @returns Map of categories with title, handle, and thumbnail
 */
export const getCategories = async () => {
    const { product_categories: categories } = await medusa.productCategories
        .list({ parent_category_id: "null" })
        .catch((err) => {
            return handleError(500, "GET_CATEGORIES.CATEGORY_LIST_FAILED", { error: err.response.data });
        });

    // console.log("Fetched categories:", categories);
    const categoryMap = new Map<string, { handle: string; title: string; thumbnail: string }[]>();

    // maybe flatten before getting thumbnails
    await Promise.all(
        categories.map(async (category) => {
            const childCategories = await Promise.all(
                category.category_children.map(async (childCategory) => {
                    const thumbnail = await getThumbnail(childCategory, "GET_CATEGORIES");
                    return {
                        title: childCategory.name,
                        handle: childCategory.handle,
                        thumbnail: thumbnail || "https://placehold.co/600",
                    };
                }),
            );

            categoryMap.set(category.name, childCategories);
        }),
    );

    // TODO : make sure categories are sorted in the desired order (using parent_category.rank)

    return { categories: categoryMap };
};

/**
 * Get category by handle
 * @param handle Category handle
 * @returns Category details with products
 */
export const getCategoryByHandle = async (handle: string) => {
    const categories = await medusa.productCategories.list({ handle }).catch((err) => {
        return handleError(500, "GET_CATEGORY_BY_HANDLE.CATEGORY_LIST_FAILED", { err: err.response.data, handle });
    });

    if (categories.count <= 0) {
        return handleError(404, "GET_CATEGORY_BY_HANDLE.CATEGORY_NOT_FOUND", { handle });
    }

    const category = categories.product_categories[0];

    const { products } = await medusa.products
        .list({
            category_id: [category.id],
            region_id: env.get("MEDUSA_REGION_ID"),
        })
        .catch((err) => {
            return handleError(500, "GET_CATEGORY_BY_HANDLE.PRODUCT_LIST_FAILED", { err: err.response.data, handle });
        });

    return {
        title: category.name,
        description: category.description,
        thumbnail: await getThumbnail(category, "GET_CATEGORY_BY_HANDLE"),
        products: transformProductsForFiltering(products),
    };
};
