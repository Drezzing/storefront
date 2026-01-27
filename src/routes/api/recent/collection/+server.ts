import { getLimit, json } from "$lib/api";
import { getRecentCollections } from "$lib/medusa/collection";

export const GET = async ({ url }) => {
    return json(await getRecentCollections(getLimit(url)));
};
