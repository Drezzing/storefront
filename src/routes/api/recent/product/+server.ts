import { getLimit, json } from "$lib/api";
import { getRecentProducts } from "$lib/medusa/product.js";

export const GET = async ({ url }) => {
    return json(await getRecentProducts(getLimit(url)));
};
