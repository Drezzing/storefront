import { z } from "zod";

export const contactObject = z.object({
    email: z.string().email(),
    subject: z.union([z.literal("Livraison"), z.literal("Paiement"), z.literal("Autre")]),
    content: z.string().min(1),
});
