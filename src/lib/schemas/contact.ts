import { z } from "zod/v3"; // sveltekit-superforms does not handles v4 or v4-mini types yet

export const contactSubjects = ["Commande", "Livraison", "Paiement", "Autre"] as const;

export const contactFormSchema = z.object({
    email: z.string().email({ message: "L'adresse email est invalide" }),
    subject: z.enum(contactSubjects, { message: "Le sujet est invalide" }),
    content: z.string().min(1, { message: "Le message est requis" }),
});

export type ContactFromType = z.infer<typeof contactFormSchema>;
export type ContactFormSchema = typeof contactFormSchema;
