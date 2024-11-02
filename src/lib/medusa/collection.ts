import type { StoreCollectionsRes } from "@medusajs/medusa";

export const isCollectionPrivate = (collection: StoreCollectionsRes["collection"]) => {
    return Boolean(collection.metadata["private"]) === true;
};
