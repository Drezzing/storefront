import { medusa } from "./medusa";
import type { MedusaCollection } from "./medusa";
import type { MedusaCategory } from "./medusa"; // finding a better way to do this

export async function getThumbnail(entity: MedusaCollection | MedusaCategory): Promise<string | null> {
    if (!entity?.metadata) return null;

    const thumbnail = entity.metadata["thumbnail"] as string | null;

    if (thumbnail && !thumbnail.startsWith("prod_")) {
        return thumbnail;
    }

    if (thumbnail?.startsWith("prod_")) {
        try {
            const product = await medusa.products.retrieve(thumbnail as string);
            return product?.product?.thumbnail || null;
        } catch (error) {
            console.error(`Erreur lors de la récupération du produit ${thumbnail}:`, error);
            return null;
        }
    }

    console.warn(`Aucun thumbnail valide trouvé pour l'entité ${entity.id}`);
    return null;
}
