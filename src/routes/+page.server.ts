import { handleError } from "$lib/error";
import { isCollectionPrivate } from "$lib/medusa/collection";
import { medusa } from "$lib/medusa/medusa";
import { getThumbnail } from "$lib/medusa/utils";

export const prerender = false;

export const load = async () => {
    // Récupérer les produits et collections simultanément
    const [products, collectionsResponse] = await Promise.all([
        medusa.products.list({ order: "-created_at", limit: 8 }), // Produits récents
        medusa.collections.list(), // Collections disponibles
    ]);

    if (products.count <= 0) {
        return handleError(404, "HOMEPAGE_LOAD.PRODUCTS_NOT_FOUND");
    }

    if (collectionsResponse.count <= 0) {
        return handleError(404, "HOMEPAGE_LOAD.COLLECTIONS_NOT_FOUND");
    }

    // Filtrer les collections privées
    const collections = collectionsResponse.collections.filter((collection) => !isCollectionPrivate(collection));

    const collectionData = await Promise.all(
        collections.map(async (collection) => {
            const thumbnail = await getThumbnail(collection);
            return {
                id: collection.id,
                title: collection.title,
                handle: collection.handle,
                thumbnail: thumbnail || "https://placehold.co/600",
                created_at: collection.created_at,
            };
        }),
    );

    return {
        products: products.products.map((product) => ({
            title: product.title ?? "",
            handle: product.handle ?? "",
            thumbnail: product.thumbnail ?? "https://placehold.co/600",
        })),
        collections: collectionData
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 8),
    };
};
