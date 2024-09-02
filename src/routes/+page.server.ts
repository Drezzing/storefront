import { handleError } from "$lib/error";
import { medusa } from "$lib/medusa/medusa";

export const prerender = false;

export const load = async () => {
    const products = await medusa.products.list({ order: "-created_at", limit: 8 });

    console.log(products.products.map((p) => p.title));

    if (products.count <= 0) {
        return handleError(404, "PRODUCT_LOAD.PRODUCT_NOT_FOUND");
    }

    return {
        products: products.products.map((product) => {
            return {
                title: product.title ?? "",
                handle: product.handle ?? "",
                thumbnail: product.thumbnail ?? "",
            };
        }),
    };
};
