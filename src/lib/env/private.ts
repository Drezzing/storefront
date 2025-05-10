import { z } from "zod";

import { env } from "$env/dynamic/private";
import { EnvParser } from "$lib/env/parser";

export const privateEnvSchema = z.object({
    MEDUSA_BACKEND_URL: z.string().url(),
    MEDUSA_PKEY: z.string().startsWith("pk_"),
    MEDUSA_API_TOKEN: z.string(),
    MEDUSA_SALES_CHANNEL_ID: z.string().startsWith("sc_"),
    MEDUSA_REGION_ID: z.string().startsWith("reg_"),

    CHECKOUT_NOTIFICATION_KEY: z.string(),

    STRIPE_WEBHOOK_KEY: z.string().startsWith("whsec_"),
    STRIPE_API_KEY: z.string().startsWith("sk_"),

    DISCORD_WEBHOOK: z.string().url(),

    REDIS_URL: z.string().url(),
});

export default new EnvParser(env, privateEnvSchema);
