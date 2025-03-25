import type { MedusaCollection } from "./medusa";

export const isCollectionPrivate = (collection: MedusaCollection) => {
    return Boolean(collection.metadata["private"]) === true;
};

export type ProductCollection = {
    handle: string;
    title: string;
    sizeGuide: string | null;
};
