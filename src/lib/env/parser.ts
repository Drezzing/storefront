import { building } from "$app/environment";
import fs from "fs";
import { z } from "zod";

export class EnvParser<TSchema extends z.ZodSchema> {
    private parsedEnv: z.infer<TSchema>;

    constructor(env: Record<string, string | undefined>, schema: TSchema) {
        const processedEnv = { ...env };
        for (const [key, value] of Object.entries(processedEnv)) {
            if (key.endsWith("_FILE") && value) {
                processedEnv[key.slice(0, -5)] = fs.readFileSync(value, "utf8").trim();
                delete processedEnv[key];
            }
        }

        if (!building) {
            const result = schema.safeParse(processedEnv);
            if (!result.success) {
                console.error("Environment variable validation failed:", result.error.format());
                process.exit(1);
            }
            this.parsedEnv = result.data;
        } else {
            this.parsedEnv = {};
        }
    }

    get<K extends keyof z.infer<TSchema>>(key: K): z.infer<TSchema>[K] {
        // will always error otherwise when building since env is empty
        if (!building && !(key in this.parsedEnv)) {
            throw new Error(`Key ${key.toString()} does not exist in environment`);
        }
        return this.parsedEnv[key];
    }
}
