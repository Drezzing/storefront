import Medusa from "@medusajs/medusa-js";
import type { StoreCartsRes, StoreVariantsRes, StoreOrdersRes, AdminDiscountsRes } from "@medusajs/medusa";
import { MEDUSA_PKEY, MEDUSA_API_TOKEN, MEDUSA_BACKEND_URL } from "$env/static/private";

type EntityExist<K extends string, V> =
    | ({ [P in K]: V } & { err: false })
    | ({ [P in K]: null } & { err: Record<string, unknown> });

export const medusa = new Medusa({
    baseUrl: MEDUSA_BACKEND_URL,
    maxRetries: 3,
    publishableApiKey: MEDUSA_PKEY,
    apiKey: MEDUSA_API_TOKEN,
});

const checkEntityExist = async <K extends string, V>(
    id: string | undefined,
    key: string,
    getterFunc: CallableFunction,
): Promise<EntityExist<K, V>> => {
    if (id === undefined) return { [key]: null, err: { type: "not_found", message: key + "undefined was not found" } };

    try {
        const req = await getterFunc(id);
        return { [key]: req[key], err: false };
    } catch (err) {
        // @ts-expect-error err is not typed but medusa error always have the same structure
        return { [key]: null, err: err.response.data };
    }
};

export const checkDiscountExist = async (id?: string) => {
    return checkEntityExist<"discount", AdminDiscountsRes["discount"]>(id, "discount", (id: string) => {
        if (id?.startsWith("disc_")) {
            return medusa.admin.discounts.retrieve(id);
        } else {
            return medusa.admin.discounts.retrieveByCode(id);
        }
    });
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
