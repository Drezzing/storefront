import fs from "fs";
import { z } from "zod";

export const envSchema = z.object({
    PUBLIC_BASE_URL: z.string().url(),
    PUBLIC_MEDUSA_DEFAULT_SHIPPING_ID: z.string().startsWith("so_"),

    MEDUSA_BACKEND_URL: z.string().url(),
    MEDUSA_PKEY: z.string().startsWith("pk_"),
    MEDUSA_API_TOKEN: z.string(),
    MEDUSA_SALES_CHANNEL_ID: z.string().startsWith("sc_"),
    MEDUSA_REGION_ID: z.string().startsWith("reg_"),

    CHECKOUT_NOTIFICATION_KEY: z.string(),

    STRIPE_WEBHOOK_KEY: z.string().startsWith("whsec_"),
    STRIPE_API_KEY: z.string().startsWith("sk_"),
    PUBLIC_STRIPE_API_KEY: z.string().startsWith("pk_"),

    DISCORD_WEBHOOK: z.string().url(),

    REDIS_URL: z.string().url(),
});

/**
 * Docker convention for secrets is to use the _FILE suffix
 * to indicate that the value is a file path. This function reads
 * the file and replaces the value in the env object with the
 * contents of the file.
 * @param env Environment variables object
 */
const substituteEnvFile = (env: Record<string, string | undefined>) => {
    for (const [key, value] of Object.entries(env)) {
        if (key.endsWith("_FILE") && value) {
            env[key.slice(0, -5)] = fs.readFileSync(value, "utf8");
            delete env[key];
        }
    }
};

export const validateEnv = async () => {
    const { env: privateEnv } = await import("$env/dynamic/private");
    const { env: publicEnv } = await import("$env/dynamic/public");

    try {
        substituteEnvFile(privateEnv);
        substituteEnvFile(publicEnv);
    } catch (error) {
        console.error("Error parsing environment variables:", error);
        process.exit(1);
    }

    const env = {
        ...privateEnv,
        ...publicEnv,
    };
    const result = envSchema.safeParse(env);

    if (!result.success) {
        console.error("Environment variable validation failed:", result.error.format());
        process.exit(1);
    }
};
