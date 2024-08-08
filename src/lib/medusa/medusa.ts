import Medusa from "@medusajs/medusa-js";
import { type StoreCartsRes, type StoreVariantsRes } from "@medusajs/medusa";
import { MEDUSA_PKEY } from "$env/static/private";

type EntityExist<K extends string, V> = ({ [P in K]: V } & { exist: true }) | ({ [P in K]: null } & { exist: false });

export type CartExist = EntityExist<"cart", StoreCartsRes["cart"]>;
export type VariantExist = EntityExist<"variant", StoreVariantsRes["variant"]>;

export const medusa = new Medusa({
    baseUrl: "http://localhost:9000",
    maxRetries: 3,
    publishableApiKey: MEDUSA_PKEY,
});

export const checkCartExists = async (cartID: string | undefined): Promise<CartExist> => {
    if (cartID === undefined) {
        return { exist: false, cart: null };
    }

    try {
        const { cart } = await medusa.carts.retrieve(cartID);
        return { exist: true, cart };
    } catch {
        return { exist: false, cart: null };
    }
};

export const checkVariantExists = async (variantID: string): Promise<VariantExist> => {
    try {
        const { variant } = await medusa.products.variants.retrieve(variantID);
        return { exist: true, variant };
    } catch {
        return { exist: false, variant: null };
    }
};
