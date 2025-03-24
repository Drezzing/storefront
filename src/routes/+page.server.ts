import { handleError } from "$lib/error";
import { isCollectionPrivate } from "$lib/medusa/collection";
import { medusa } from "$lib/medusa/medusa";
import { getThumbnail } from "$lib/medusa/utils";
import { getThumbnailCarrousell } from "$lib/medusa/utils";

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

    // Récupérer les données des collections avec leurs thumbnails
    const collectionData = await Promise.all(
        collections.map(async (collection) => {
        //   console.log(`Collection ID: ${collection.id}, Metadata: ${JSON.stringify(collection.metadata)}`); // Vérifie les métadonnées
          const thumbnail = await getThumbnail(collection);
          return {
            id: collection.id,
            title: collection.title,
            handle: collection.handle,
            thumbnail: thumbnail || "https://placehold.co/600",
            created_at: collection.created_at,
          };
        })
      );
      

    // Construire les données pour le carrousel
    const carrousell = await Promise.all(
        collections.map(async (collectionc) => {
            const images = await getThumbnailCarrousell({ id: collectionc.id, metadata: collectionc.metadata });
            if (images) {
                return {
                    link: `/collection/${collectionc.handle}`,
                    images, // Cela sera un tableau d'images
                    alt: collectionc.title,
                };
            }
            return null; // Ne pas inclure dans le carrousel si aucune image
        })
    ).then((items) => items.filter((item) => item !== null)); // Filtrer les éléments nuls

    // Optionnel : S'assurer qu'il y a bien des éléments dans le carrousel
    if (carrousell.length === 0) {
        console.error("Aucun carrousel disponible");
    }

    // Retourner les données nécessaires à la page
    return {
        products: products.products.map((product) => ({
            title: product.title ?? "",
            handle: product.handle ?? "",
            thumbnail: product.thumbnail ?? "https://placehold.co/600", // Image par défaut si pas de thumbnail
        })),
        collections: collectionData
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Trier les collections par date de création
            .slice(0, 8), // Limiter à 8 collections
        carrousell, // Les données pour le carrousel
    };
};
