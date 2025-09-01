import { z } from "zod/v4-mini";

import env from "$lib/env/public";

const nameRegex = z.regex(/^([a-zA-Zà-žÀ-Ž\- ']*)$/g, { error: "Contient des caractères non-autorisé" });

export const userInfoFormSchema = z.object({
    firstName: z
        .string({ message: "Le prénom doit être une chaine de caractères" })
        .check(nameRegex, z.minLength(1, { error: "Le prénom est requis" })),
    lastName: z
        .string({ message: "Le nom doit être une chaine de caractères" })
        .check(nameRegex, z.minLength(1, { error: "Le nom est requis" })),

    mail: z.email({ message: "L'adresse mail est invalide" }),
    profile: z.enum(
        [
            "Prep'Isima 1",
            "Prep'Isima 2",
            "ZZ1",
            "ZZ2",
            "ZZ3",
            "ZApp1",
            "ZApp2",
            "ZApp3",
            "Master 1",
            "Master 2",
            "Enseignant",
            "Personnel administratif",
            "Intervenant extérieur",
        ],
        { error: "Le profile est requis" },
    ),
});

export const shippingFormSchema = z
    .object({
        method: z.string(),
        address: z.optional(z.string()),
        complement: z.optional(z.string()),
        city: z.optional(z.string()),
        postal_code: z.optional(z.string()),
        // department: z.optional(z.string()),
        // country: z.optional(z.string()),
    })
    .check((ctx) => {
        if (!ctx.value.method) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value.method,
                path: ["method"],
                message: "Le mode de livraison est requis",
            });
            return;
        }

        if (ctx.value.method !== env.get("PUBLIC_MEDUSA_DEFAULT_SHIPPING_ID")) {
            if (!ctx.value.address)
                ctx.issues.push({
                    code: "custom",
                    input: ctx.value.address,
                    path: ["address"],
                    message: "L'adresse est requise",
                });
            if (!ctx.value.city)
                ctx.issues.push({
                    code: "custom",
                    input: ctx.value.city,
                    path: ["city"],
                    message: "La ville est requise",
                });
            if (!ctx.value.postal_code)
                ctx.issues.push({
                    code: "custom",
                    input: ctx.value.postal_code,
                    path: ["postal_code"],
                    message: "Le code postal est requis",
                });
            // if (!data.country)
            //     ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["country"], message: "Le pays est requis" });
        }
    });

export const confirmationTokenData = z.object({
    confirmationToken: z.string(),
});

export type UserInfoFormSchema = typeof userInfoFormSchema;
export type UserInfoFormType = z.infer<UserInfoFormSchema>;

export type ShippingFormSchema = typeof shippingFormSchema;
export type ShippingFormType = z.infer<ShippingFormSchema>;
