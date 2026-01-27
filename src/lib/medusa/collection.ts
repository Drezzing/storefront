import { handleError } from "$lib/error";
import { medusa, type MedusaCollection } from "./medusa";
import { getThumbnail } from "./utils";

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
