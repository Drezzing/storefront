import { getCategoryByHandle } from "$lib/medusa/category";

export const prerender = false;

export const load = async ({ params }) => {
    return await getCategoryByHandle(params.id);
};
