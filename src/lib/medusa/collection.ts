import env from "$lib/env/private";
import { handleError } from "$lib/error";
import { medusa, type MedusaCollection } from "$lib/medusa/medusa";
import { transformProductsForFiltering } from "$lib/medusa/product";
import { getThumbnail } from "$lib/medusa/utils";

export const isCollectionPrivate = (collection: MedusaCollection) => {
    return Boolean(collection.metadata["private"]) === true;
};

/**
 * Get recent collections
 * @param limit Number of collections to retrieve
 * @returns Array of recent collections
 */
export const getRecentCollections = async (limit: number) => {
    const availableCollections = await medusa.collections.list();

    if (availableCollections.count <= 0) {
        return handleError(404, "GET_RECENT_COLLECTIONS.COLLECTIONS_NOT_FOUND");
    }

    const collections = availableCollections.collections.filter((collection) => !isCollectionPrivate(collection));
    const collectionData = await Promise.all(
        collections.map(async (collection) => {
            const thumbnail = await getThumbnail(collection, "HOMEPAGE_LOAD");
            return {
                id: collection.id,
                title: collection.title,
                handle: collection.handle,
                thumbnail: thumbnail || "https://placehold.co/600",
                created_at: collection.created_at,
            };
        }),
    );

    return collectionData
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
};

/**
 * Get all the public collections
 * @returns Array of collections with title, handle, and thumbnail
 */
export const getCollections = async () => {
    const collectionsResponse = await medusa.collections.list().catch((err) => {
        return handleError(500, "GET_COLLECTIONS.COLLECTIONS_LIST_FAILED", { error: err.response.data });
    });

    const collections = collectionsResponse.collections.filter((collection) => !isCollectionPrivate(collection));

    const collectionsWithThumbnails = await Promise.all(
        collections.map(async (collection) => {
            const thumbnail = await getThumbnail(collection, "GET_COLLECTIONS");
            return {
                title: collection.title,
                handle: collection.handle,
                thumbnail: thumbnail || "https://via.placeholder.com/600x600",
            };
        }),
    );

    return {
        collections: collectionsWithThumbnails,
    };
};

export const getCollectionByHandle = async (handle: string) => {
    const collections = await medusa.collections.list({ handle: [handle] }).catch((err) => {
        return handleError(500, "GET_COLLECTION_BY_HANDLE.COLLECTION_LIST_FAILED", { err: err.response.data, handle });
    });

    if (collections.count <= 0) {
        return handleError(404, "GET_COLLECTION_BY_HANDLE.COLLECTION_NOT_FOUND", { handle });
    }

    const collection = collections.collections[0];

    if (isCollectionPrivate(collection)) {
        return handleError(404, "GET_COLLECTION_BY_HANDLE.COLLECTION_PRIVATE", { handle });
    }

    const { products } = await medusa.products
        .list({
            collection_id: [collection.id],
            region_id: env.get("MEDUSA_REGION_ID"),
        })
        .catch((err) => {
            return handleError(500, "GET_COLLECTION_BY_HANDLE.PRODUCT_LIST_FAILED", { err: err.response.data, handle });
        });

    const description = collection.metadata?.["description"] as string | undefined;
    const cpv = collection.metadata?.["cpv"] as string | undefined;
    const guideTaille = collection.metadata?.["guide-taille"] as string | undefined;

    return {
        title: collection.title,
        handle: collection.handle,
        thumbnail: await getThumbnail(collection, "GET_COLLECTION_BY_HANDLE"),
        description: description,
        cpv: cpv,
        guideTaille: guideTaille,
        products: transformProductsForFiltering(products),
    };
};
