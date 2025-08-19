import type { ServerInit, HandleValidationError } from "@sveltejs/kit";

import { building } from "$app/environment";
import { handleError } from "$lib/error";

export const init: ServerInit = async () => {
    if (building) {
        return;
    }

    // cannot import at top level because it tries to prerender but $lib/redis imports $env/dynamic
    const { redisInit } = await import("$lib/redis");
    await redisInit();
};

export const handleValidationError: HandleValidationError = async ({ event, issues }) => {
    const remoteFunction = new URL(event.request.url).pathname.split("/").at(-1);
    return handleError(400, remoteFunction + ".BAD_REQUEST", { issues });
};
