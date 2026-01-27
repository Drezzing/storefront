import { getProductByHandle } from "$lib/medusa/product";

export const prerender = false;

export const load = async ({ params }) => {
    return await getProductByHandle(params.id);
};
