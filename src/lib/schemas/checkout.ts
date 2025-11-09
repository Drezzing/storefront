import { z } from "zod/v4-mini";

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
            "ZZ+",
            "Master 1",
            "Master 2",
            "Enseignant",
            "Personnel administratif",
            "Intervenant extérieur",
        ],
        { error: "Le profile est requis" },
    ),
});

const baseShippingForm = z.object({
    method: z.string(),
});

export const shippingManualSchema = z.object({
    ...baseShippingForm.shape,
    fulfillment_id: z.literal("manual-fulfillment"),
});

export const shippingMondialRelayParcelSchema = z.object({
    ...baseShippingForm.shape,
    fulfillment_id: z.literal("mondial-relay-point-relais"),
    parcel_id: z.string({ error: "Le point relais est requis" }),
});

export const shippingMondialRelayHomeSchema = z.object({
    ...baseShippingForm.shape,
    fulfillment_id: z.literal("mondial-relay-home"),
    address: z
        .string({ error: "L'adresse est requise" })
        .check(
            z.minLength(5, { error: "L'adresse doit faire au moins 5 caractères" }),
            z.maxLength(40, { error: "L'adresse ne doit pas faire plus de 40 caractères" }),
            z.regex(/^[0-9A-Za-zÀ-ÖØ-öø-ÿ_\-'.,\s]*$/g, { error: "Contient des caractères non-autorisé" }),
        ),
    complement: z.optional(
        z
            .string()
            .check(
                z.maxLength(30, { error: "Le complément ne doit pas faire plus de 30 caractères" }),
                z.regex(/^[A-Za-zÀ-ÖØ-öø-ÿ_\-'.,\s]*$/g, { error: "Contient des caractères non-autorisé" }),
            ),
    ),
    city: z
        .string()
        .check(
            z.minLength(2, { error: "La ville doit faire au moins 2 caractères" }),
            z.maxLength(30, { error: "La ville ne doit pas faire plus de 30 caractères" }),
            z.regex(/^[A-Za-zÀ-ÖØ-öø-ÿ_\-'.,\s]*$/g, { error: "Contient des caractères non-autorisé" }),
        ),
    postal_code: z.string().check(z.regex(/^[0-9]{5}$/g, { error: "Le code postal est invalide" })),
    phone: z.union(
        [
            z.string().check(z.regex(/\+33[1-9][0-9]{8}$/)), // France
            z.string().check(z.regex(/\+377[0-9]{5,9}$$/)), // Monaco
            z.string().check(z.regex(/\+262[1-9][0-9]{6}$/)), // Réunion + Mayotte
            z.string().check(z.regex(/\+590[1-9][0-9]{6}$/)), // Guadeloupe
            z.string().check(z.regex(/\+594[1-9][0-9]{8}$/)), // Guyane
            z.string().check(z.regex(/\+596[1-9][0-9]{8}$/)), // Martinique
        ],
        { error: "Le numéro de téléphone est invalide" },
    ),
});

export const shippingFormSchema = z.discriminatedUnion("fulfillment_id", [
    shippingManualSchema,
    shippingMondialRelayParcelSchema,
    shippingMondialRelayHomeSchema,
]);

export type ShippingManualFormSchema = typeof shippingManualSchema;
export type ShippingMondialRelayParcelSchema = typeof shippingMondialRelayParcelSchema;

export type ShippingMondialRelayHomeSchema = typeof shippingMondialRelayHomeSchema;
export type ShippingMondialRelayHomeType = z.infer<ShippingMondialRelayHomeSchema>;

export const confirmationTokenData = z.object({
    confirmationToken: z.string(),
});

export type UserInfoFormSchema = typeof userInfoFormSchema;
export type UserInfoFormType = z.infer<UserInfoFormSchema>;
