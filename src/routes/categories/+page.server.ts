import { getCategories } from "$lib/medusa/category";

export const prerender = false;

export const load = async () => {
    return await getCategories();
};
