import { z } from "zod/v4-mini";

export const mondialRelayParcelSearchSchema = z.object({
    ville: z.string(),
    cp: z.string(),
});

export const mondialRelayPositionSearchSchema = z.object({
    lon: z.number(),
    lat: z.number(),
});

export type mondialRelayPositionSearchType = z.infer<typeof mondialRelayPositionSearchSchema>;
