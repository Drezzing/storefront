import { z } from "zod/v4-mini";

import { json } from "$lib/api";
import { handleError } from "$lib/error";
import { getParcelFromPos } from "$lib/mondial-relay/mondial-relay.remote";

const findPointRelaisSchema = z.object({
    lat: z.coerce.number().check(z.minimum(-90), z.maximum(90)),
    lng: z.coerce.number().check(z.minimum(-180), z.maximum(180)),
});

export const GET = async ({ url }) => {
    const lat = url.searchParams.get("lat");
    const lng = url.searchParams.get("lng");

    const parseResult = findPointRelaisSchema.safeParse({ lat, lng });
    if (!parseResult.success) {
        return handleError(400, "FIND_POINT_RELAIS.INVALID_QUERY_PARAMS");
    }

    return json(await getParcelFromPos({ lon: parseResult.data.lng, lat: parseResult.data.lat }));
};
