import { getCollectionByHandle } from "$lib/medusa/collection";

export const prerender = false;

export const load = async ({ params }) => {
    return await getCollectionByHandle(params.id);
};
