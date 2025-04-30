import { env } from "$env/dynamic/private";
import { handleError } from "$lib/error";
import { isCollectionPrivate } from "$lib/medusa/collection";
import { medusa } from "$lib/medusa/medusa";
import { getProducts } from "$lib/medusa/product";
import { getThumbnail } from "$lib/medusa/utils";

export const prerender = false;

export const load = async ({ params }) => {
    const collections = await medusa.collections.list({ handle: [params.id] }).catch((err) => {
        return handleError(500, "COLLECTION_LOAD.COLLECTION_LIST_FAILED", { err: err.response.data });
    });

    if (collections.count <= 0) {
        return handleError(404, "COLLECTION_LOAD.COLLECTION_NOT_FOUND");
    }

    const collection = collections.collections[0];

    if (isCollectionPrivate(collection)) {
        return handleError(404, "COLLECTION_LOAD.COLLECTION_PRIVATE");
    }

    const { products } = await medusa.products
        .list({
            collection_id: [collection.id],
            region_id: env.MEDUSA_REGION_ID,
        })
        .catch((err) => {
            return handleError(500, "COLLECTION_LOAD.PRODUCT_LIST_FAILED", { err: err.response.data });
        });

    const description = collection.metadata?.["description"] as string | undefined;
    const cpv = collection.metadata?.["cpv"] as string | undefined;
    const guideTaille = collection.metadata?.["guide-taille"] as string | undefined;

    return {
        title: collection.title,
        handle: collection.handle,
        thumbnail: await getThumbnail(collection, "COLLECTION_LOAD"),
        description: description,
        cpv: cpv,
        guideTaille: guideTaille,
        products: getProducts(products),
    };
};
