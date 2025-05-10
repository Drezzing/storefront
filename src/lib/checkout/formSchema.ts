import { z } from "zod";

import env from "$lib/env/public";

const nameRegex = /^([a-zA-Zà-žÀ-Ž\- ']*)$/g;

export const userInfoFormSchema = z.object({
    firstName: z
        .string({ message: "Le prénom doit être une chaine de caractères" })
        .regex(nameRegex, { message: "Contient des caractères non-autorisé" })
        .nonempty({ message: "Le prénom est requis" }),
    lastName: z
        .string({ message: "Le nom doit être une chaine de caractères" })
        .regex(nameRegex, { message: "Contient des caractères non-autorisé" })
        .nonempty({ message: "Le nom est requis" }),
    mail: z
        .string({ message: "L'adresse mail doit être une chaine de caractères" })
        .email({ message: "L'adresse mail est invalide" }),
});

// const shippingFormSchemaWithShipping = z.object({
//     method: z.string().startsWith("so_"),
//     address: z.string().nonempty(),
//     complement: z.string(),
//     city: z.string().nonempty(),
//     postal_code: z.string().nonempty(),
//     department: z.string().nonempty(),
//     country: z.string().nonempty(),
// });

// const shippingFormSchemaWithoutShipping = z.object({
//     method: z.literal(PUBLIC_DEFAULT_SHIPPING_ID),
//     address: z.null(),
//     complement: z.null(),
//     city: z.null(),
//     postal_code: z.null(),
//     department: z.null(),
//     country: z.null(),
// });

// export const shippingFormSchema = z.union([shippingFormSchemaWithShipping, shippingFormSchemaWithoutShipping]);

export const shippingFormSchema = z
    .object({
        method: z.string(),
        address: z.string().optional(),
        complement: z.string().optional(),
        city: z.string().optional(),
        postal_code: z.string().optional(),
        department: z.string().optional(),
        // country: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (!data.method) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["method"], message: "Le mode de livraison est requis" });
            return;
        }

        if (data.method !== env.get("PUBLIC_MEDUSA_DEFAULT_SHIPPING_ID")) {
            if (!data.address)
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["address"], message: "L'adresse est requise" });
            if (!data.city)
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["city"], message: "La ville est requise" });
            if (!data.postal_code)
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
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
export type ShippingFormSchema = typeof shippingFormSchema;
