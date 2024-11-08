import type { MedusaCollection } from "./medusa";

export const isCollectionPrivate = (collection: MedusaCollection) => {
    return Boolean(collection.metadata["private"]) === true;
};
