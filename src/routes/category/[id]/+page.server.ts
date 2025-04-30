import { env } from "$env/dynamic/private";
import { handleError } from "$lib/error";
import { medusa } from "$lib/medusa/medusa";
import { getProducts } from "$lib/medusa/product.js";
import { getThumbnail } from "$lib/medusa/utils";

export const prerender = false;

export const load = async ({ params }) => {
    const categories = await medusa.productCategories.list({ handle: params.id }).catch((err) => {
        return handleError(500, "CATEGORY_LOAD.COLLECTION_LIST_FAILED", { err: err.response.data });
    });

    if (categories.count <= 0) {
        return handleError(404, "CATEGORY_LOAD.COLLECTION_NOT_FOUND");
    }

    const category = categories.product_categories[0];

    const { products } = await medusa.products
        .list({
            category_id: [category.id],
            region_id: env.MEDUSA_REGION_ID,
        })
        .catch((err) => {
            return handleError(500, "CATEGORY_LOAD.PRODUCT_LIST_FAILED", { err: err.response.data });
        });

    return {
        title: category.name,
        description: category.description,
        thumbnail: await getThumbnail(category, "CATEGORY_LOAD"),
        products: getProducts(products),
    };
};
