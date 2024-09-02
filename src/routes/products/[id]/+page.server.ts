import { medusa } from "$lib/medusa/medusa";
import { PUBLIC_REGION_ID } from "$env/static/public";
import { handleError } from "$lib/error.js";

export const prerender = false;

export const load = async ({ params }) => {
    const products = await medusa.products.list({ handle: params.id, region_id: PUBLIC_REGION_ID }).catch((err) => {
        return handleError(500, "PRODUCT_LOAD.PRODUCTS_LIST_FAILED", { err: err.response.data });
    });

    if (products.count <= 0) {
        return handleError(404, "PRODUCT_LOAD.PRODUCT_NOT_FOUND");
    }
    const product = products.products[0];

    const optionMap = new Map<string, Array<string>>();

    for (const option of product.options ?? []) {
        const optionValues = new Set<string>();
        for (const value of option.values) {
            optionValues.add(value.value);
        }
        optionMap.set(option.title, Array.from(optionValues).sort());
    }

    const variantMap = new Array<{ id: string; options: Set<string>; price: number }>();
    for (const variant of product.variants) {
        const variantOptions = new Set<string>(variant.options?.map((option) => option.value));
        variantMap.push({ id: variant.id!, options: variantOptions, price: variant.original_price || 0.42 });
    }

    return {
        title: product.title || "Placeholder title",
        description: product.description || "Placeholder description blabla",
        images: product.images || [{ url: "" }],
        collection: product.collection || { handle: "placeholder", title: "Placeholder" },
        options: optionMap,
        variants: variantMap,
    };
};
