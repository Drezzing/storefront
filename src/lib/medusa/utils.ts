import { handleError } from "$lib/error";
import { logger } from "$lib/logger";
import { medusa, type MedusaCategory, type MedusaCollection } from "$lib/medusa/medusa";
import { CacheTTL, thumbnailCache } from "$lib/redis";

export async function getThumbnail(entity: MedusaCollection | MedusaCategory, caller: string): Promise<string | null> {
    let thumbnail = entity.metadata["thumbnail"] as string | null;
    if (!thumbnail) {
        thumbnail = entity.metadata["front_page_product"] as string | null;
    }

    if (!thumbnail) {
        return null;
    }
    if (thumbnail.startsWith("prod_")) {
        const cachedThumbnail = await thumbnailCache.get<string>(entity.id);
        if (cachedThumbnail) {
            return cachedThumbnail;
        }

        const product = await medusa.products.retrieve(thumbnail).catch((err) => {
            return handleError(500, caller + ".THUMBNAIL_GET_FAILED", err.response.data);
        });
        thumbnail = product?.product.thumbnail || null;

        if (thumbnail) {
            await thumbnailCache.set(entity.id, thumbnail, CacheTTL.Medium);
        }
    }

    if (!thumbnail) {
        logger.warn(`Aucun thumbnail valide trouvé pour l'entité ${entity.id}`);
    }
    return thumbnail;
}
