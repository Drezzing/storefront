import { z } from "zod/v4-mini";

import env from "$lib/env/public";

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

export type ShippingFormSchema = typeof shippingFormSchema;
export type ShippingFormType = z.infer<ShippingFormSchema>;
