import { getCategories } from "$lib/medusa/categories";

export const prerender = false;

export const load = async () => {
    return getCategories();
};
