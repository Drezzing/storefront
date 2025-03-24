import { handleError } from "$lib/error";
import { isCollectionPrivate } from "$lib/medusa/collection";
import { medusa } from "$lib/medusa/medusa";
import { getThumbnail } from "$lib/medusa/utils";
import type { PageServerLoad } from "./$types";


export const prerender = false;

export const load: PageServerLoad = async () => {
    const collectionsResponse = await medusa.collections.list().catch((err) => {
        return handleError(500, "COLLECTIONS_LOAD.COLLECTIONS_LIST_FAILED", { error: err.response.data });
    });

    // Filtrer les collections privées
    const collections = collectionsResponse.collections.filter((collection) => !isCollectionPrivate(collection));

    // Récupérer les thumbnails en parallèle
    const collectionsWithThumbnails = await Promise.all(
        collections.map(async (collection) => {
            const thumbnail = await getThumbnail(collection);
            return {
                title: collection.title,
                handle: collection.handle,
                thumbnail: thumbnail || "https://via.placeholder.com/600x600",
            };
        })
    );

    return {
        collections: collectionsWithThumbnails,
    };
};
