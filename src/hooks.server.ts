import type { ServerInit } from "@sveltejs/kit";

import { building } from "$app/environment";

export const init: ServerInit = async () => {
    if (building) {
        return;
    }

    // cannot import at top level because it tries to prerender but $lib/redis imports $env/dynamic
    const { redisInit } = await import("$lib/redis");
    await redisInit();
};
