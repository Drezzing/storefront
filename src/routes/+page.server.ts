import { getRecentCollections } from "$lib/medusa/collection";
import { getRecentProducts } from "$lib/medusa/product";

export const prerender = false;

export const load = async () => {
    const limit = 8;
    const [products, collections] = await Promise.all([getRecentProducts(limit), getRecentCollections(limit)]);
    return { products, collections };
};
