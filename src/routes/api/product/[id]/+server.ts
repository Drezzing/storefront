import { json } from "$lib/api";
import { getProductByHandle } from "$lib/medusa/product.js";

export const GET = async ({ params }) => {
    return json(await getProductByHandle(params.id));
};
