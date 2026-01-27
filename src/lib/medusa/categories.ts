import { handleError } from "$lib/error";
import { medusa } from "$lib/medusa/medusa";
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
