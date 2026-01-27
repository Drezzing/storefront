import { handleError } from "$lib/error";
import { isCollectionPrivate } from "$lib/medusa/collection";
import { medusa } from "$lib/medusa/medusa";

export const load = async () => {
    const collections = await medusa.collections.list({ handle: ["promo2024"] }).catch((err) => {
        return handleError(500, "COLLECTION_LOAD.COLLECTION_LIST_FAILED", { error: err.response.data });
    });

    if (collections.count <= 0) {
        return handleError(404, "COLLECTION_LOAD.COLLECTION_NOT_FOUND");
    }

    const collection = collections.collections[0];

    if (isCollectionPrivate(collection)) {
        return handleError(404, "COLLECTION_LOAD.COLLECTION_PRIVATE");
    }
};
