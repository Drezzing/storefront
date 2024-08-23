import Medusa from "@medusajs/medusa-js";
import { type StoreCartsRes, type StoreVariantsRes, type StoreOrdersRes } from "@medusajs/medusa";
import { MEDUSA_PKEY, MEDUSA_API_TOKEN } from "$env/static/private";

type EntityExist<K extends string, V> = ({ [P in K]: V } & { err: false }) | ({ [P in K]: null } & { err: true });

export const medusa = new Medusa({
    baseUrl: "http://localhost:9000",
    maxRetries: 3,
    publishableApiKey: MEDUSA_PKEY,
    apiKey: MEDUSA_API_TOKEN,
});

const checkEntityExist = async <K extends string, V>(
    id: string | undefined,
    key: string,
    getterFunc: CallableFunction,
): Promise<EntityExist<K, V>> => {
    if (id === undefined) return { [key]: null, err: true };

    try {
        const req = await getterFunc(id);
        return { [key]: req[key], err: false };
    } catch {
        return { [key]: null, err: true };
    }
};

export const checkCartExists = async (id?: string) => {
    return checkEntityExist<"cart", StoreCartsRes["cart"]>(id, "cart", (id: string) => medusa.carts.retrieve(id));
};

export const checkVariantExists = async (id?: string) => {
    return checkEntityExist<"variant", StoreVariantsRes["variant"]>(id, "variant", (id: string) =>
        medusa.products.variants.retrieve(id),
    );
};

export const checkOrderExists = async (id?: string) => {
    if (id?.startsWith("cart_")) {
        return checkEntityExist<"order", StoreOrdersRes["order"]>(id, "order", (id: string) =>
            medusa.orders.retrieveByCartId(id),
        );
    } else {
        return checkEntityExist<"order", StoreOrdersRes["order"]>(id, "order", (id: string) =>
            medusa.orders.retrieve(id),
        );
    }
};
