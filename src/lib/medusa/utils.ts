import { medusa } from "./medusa"; // Medusa SDK

export async function getThumbnail(entity: { metadata?: Record<string, any>; id: string }): Promise<string | null> {
    if (!entity?.metadata) return null;

    const thumbnail = entity.metadata["thumbnail"];

    // Si c'est une URL directe, on la retourne immédiatement
    if (thumbnail && !thumbnail.startsWith("prod_")) {
        return thumbnail;
    }

    // Si c'est un product_id, on récupère son thumbnail
    if (thumbnail?.startsWith("prod_")) {
        try {
            const product = await medusa.products.retrieve(thumbnail);
            return product?.product?.thumbnail || null;
        } catch (error) {
            console.error(`Erreur lors de la récupération du produit ${thumbnail}:`, error);
            return null;
        }
    }

    // Fallback : Récupérer le thumbnail du premier produit de la collection/catégorie
    try {
        const products = await medusa.products.list({ collection_id: [entity.id], category_id: [entity.id], limit: 1 });
        return products?.products[0]?.thumbnail || null;
    } catch (error) {
        console.error(`Erreur lors de la récupération du premier produit pour ${entity.id}:`, error);
        return null;
    }
}
export async function getThumbnailCarrousell(entity: { metadata?: Record<string, any>; id: string }): Promise<string[] | null> {
  if (!entity?.metadata) {
    console.log(`Aucune metadata pour l'entité ${entity.id}`);
    return null;
  }

  const thumbnails: string[] = [];

  // Vérifie les métadonnées pour les clés commençant par "thumbnail_carrousell_"
  for (const key in entity.metadata) {
    if (key.startsWith("thumbnail_carrousell_")) {
      const thumbnail = entity.metadata[key];
      console.log(`Clé trouvée: ${key}, valeur: ${thumbnail}`);
      
      // Si c'est une URL directe
      if (thumbnail && !thumbnail.startsWith("prod_")) {
        // Si l'URL se termine par un "/", on fetch les images du dossier
        if (thumbnail.endsWith("/")) {
          try {
            const response = await fetch(thumbnail);
            if (response.ok) {
                const parser = new DOMParser();
                const text = await response.text();
                const doc = parser.parseFromString(text, "text/html");
                const links = Array.from(doc.querySelectorAll("a"));
                const files: string[] = links
                .map(link => link.href)
                .filter(href => /\.(jpe?g|png|gif|webp)$/i.test(href)); // Filtre les URLs d'images
              thumbnails.push(...files);
            } else {
              console.error(`Erreur lors de la récupération des images du dossier ${thumbnail}: ${response.statusText}`);
            }
          } catch (error) {
            console.error(`Erreur lors de la récupération des images du dossier ${thumbnail}:`, error);
          }
        } else {
          thumbnails.push(thumbnail);
        }
      }

      // Si c'est un product_id, on récupère son thumbnail
      if (thumbnail?.startsWith("prod_")) {
        try {
          const product = await medusa.products.retrieve(thumbnail);
          if (product?.product?.thumbnail) {
            thumbnails.push(product.product.thumbnail);
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération du produit ${thumbnail}:`, error);
        }
      }
    }
  }

  // Retourne les thumbnails si on en a trouvé, sinon retourne null
  return thumbnails.length > 0 ? thumbnails : null;
}



