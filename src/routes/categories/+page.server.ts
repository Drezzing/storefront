import { handleError } from "$lib/error";
import { medusa } from "$lib/medusa/medusa.js";
import { getThumbnail } from "$lib/medusa/utils";

export const prerender = false;

export const load = async () => {
    // Récupération des catégories principales
    const { product_categories: categories } = await medusa.productCategories
        .list({ parent_category_id: "null" })
        .catch((err) => {
            return handleError(500, "CATEGORIES_LOAD.COLLECTION_LIST_FAILED", { error: err.response.data });
        });

    // Récupération des thumbnails en parallèle
    const categoryMap = new Map<string, { handle: string; title: string; thumbnail: string }[]>();

    await Promise.all(
        categories.map(async (category) => {
            const childCategories = await Promise.all(
                category.category_children.map(async (childCategory) => {
                    const thumbnail = await getThumbnail(childCategory);
                    return {
                        title: childCategory.name,
                        handle: childCategory.handle,
                        thumbnail: thumbnail || "https://placehold.co/600",
                    };
                })
            );

            categoryMap.set(category.name, childCategories);
        })
    );

    return { categories: categoryMap };
};
