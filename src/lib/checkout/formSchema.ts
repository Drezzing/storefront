import { z } from "zod";

export const CartName = z.string().regex(/^([a-zA-Zà-žÀ-Ž\- ']+)$/g);

export const userInfoFormSchema = z.object({
    firstName: CartName,
    lastName: CartName,
    mail: z.string().email(),
});

export const shippingFormSchema = z.object({
    method: z.string().startsWith("so_"),
});

export const shippingAddressForm = z.object({});

export type UserInfoFormSchema = typeof userInfoFormSchema;
export type ShippingFormSchema = typeof shippingFormSchema;
