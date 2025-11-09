import { z } from "zod/v4-mini";

export const publicEnvSchema = z.object({
    PUBLIC_BASE_URL: z.url(),
    PUBLIC_MEDUSA_DEFAULT_SHIPPING_ID: z.string().check(z.startsWith("so_")),
    PUBLIC_STRIPE_API_KEY: z.string().check(z.startsWith("pk_")),
});

export const privateEnvSchema = z.object({
    MEDUSA_BACKEND_URL: z.url(),
    MEDUSA_PKEY: z.string().check(z.startsWith("pk_")),
    MEDUSA_API_TOKEN: z.string(),
    MEDUSA_SALES_CHANNEL_ID: z.string().check(z.startsWith("sc_")),
    MEDUSA_REGION_ID: z.string().check(z.startsWith("reg_")),

    CHECKOUT_NOTIFICATION_KEY: z.string(),

    STRIPE_WEBHOOK_KEY: z.string().check(z.startsWith("whsec_")),
    STRIPE_API_KEY: z.string().check(z.startsWith("sk_")),

    MONDIAL_RELAY_ENSEIGNE: z.string(),
    MONDIAN_RELAY_API1_PRIVATE_KEY: z.string(),
    SHIPPING_AES_KEY: z.string().check(z.length(32)),

    DISCORD_WEBHOOK: z.url(),

    REDIS_URL: z.url(),
});
