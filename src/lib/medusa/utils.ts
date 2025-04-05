import { handleError } from "$lib/error";
import { logger } from "$lib/logger";
import { medusa, type MedusaCategory, type MedusaCollection } from "$lib/medusa/medusa";
import { CacheTTL, thumbnailCache } from "$lib/redis";

export async function getThumbnail(entity: MedusaCollection | MedusaCategory, caller: string): Promise<string | null> {
    let thumbnailKey = entity.metadata["thumbnail"] as string | null;
    if (!thumbnailKey) {
        thumbnailKey = entity.metadata["front_page_product"] as string | null;
    }

    if (!thumbnailKey) {
        return null;
    }

    let thumbnail: string | null = thumbnailKey;

    if (thumbnailKey.startsWith("prod_")) {
        const cachedThumbnail = await thumbnailCache.get<string>(thumbnailKey);
        if (cachedThumbnail) {
            return cachedThumbnail;
        }

        const { product } = await medusa.products.retrieve(thumbnailKey).catch((err) => {
            return handleError(500, caller + ".THUMBNAIL_GET_FAILED", err.response.data);
        });
        thumbnail = product.thumbnail || null;

        if (thumbnail) {
            if (product.id !== thumbnailKey) {
                return handleError(500, caller + ".THUMBNAIL_PRODUCT_ID_MISMATCH", {
                    productId: product.id,
                    thumbnailId: thumbnail,
                    entityId: entity.id,
                });
            }

            await thumbnailCache.set(product.id!, thumbnail, CacheTTL.Medium);
        }
    }

    if (!thumbnail) {
        logger.warn(`Aucun thumbnail valide trouvé pour l'entité ${entity.id}`);
    }
    return thumbnail;
}
