import { z } from "zod/v4-mini";

export const mondialRelayParcelSearchSchema = z.object({
    ville: z.string(),
    cp: z.string(),
});
