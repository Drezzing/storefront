import { z } from "zod";

import { env } from "$env/dynamic/public";
import { EnvParser } from "$lib/env/parser";

export const publicEnvSchema = z.object({
    PUBLIC_BASE_URL: z.string().url(),
    PUBLIC_MEDUSA_DEFAULT_SHIPPING_ID: z.string().startsWith("so_"),
    PUBLIC_STRIPE_API_KEY: z.string().startsWith("pk_"),
});

export default new EnvParser(env, publicEnvSchema);
