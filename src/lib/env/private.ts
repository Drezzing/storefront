import { env } from "$env/dynamic/private";
import { EnvParser } from "$lib/env/parser";
import { privateEnvSchema } from "$lib/schemas/env";

export default new EnvParser(env, privateEnvSchema);
