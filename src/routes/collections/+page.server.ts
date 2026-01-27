import { getCollections } from "$lib/medusa/collection";
import type { PageServerLoad } from "./$types";

export const prerender = false;

export const load: PageServerLoad = async () => {
    return await getCollections();
};
