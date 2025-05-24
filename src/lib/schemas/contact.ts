import { z } from "zod/v4-mini";

export const contactSubjects = ["Commande", "Livraison", "Paiement", "Autre"] as const;

export const contactFormSchema = z.object({
    email: z.email({ error: "L'adresse email est invalide" }),
    subject: z.enum(contactSubjects, { error: "Le sujet est invalide" }),
    content: z.string().check(z.minLength(1, { error: "Le message est requis" })),
});

export type ContactFromType = z.infer<typeof contactFormSchema>;
export type ContactFormSchema = typeof contactFormSchema;
