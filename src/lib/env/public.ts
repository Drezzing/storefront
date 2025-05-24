import { env } from "$env/dynamic/public";
import { EnvParser } from "$lib/env/parser";
import { publicEnvSchema } from "$lib/schemas/env";

export default new EnvParser(env, publicEnvSchema);
