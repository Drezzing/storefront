import type { ServerInit } from "@sveltejs/kit";

import { building } from "$app/environment";
import { validateEnv } from "$lib/env";

export const init: ServerInit = async () => {
    if (!building) {
        await validateEnv();
    }
};
