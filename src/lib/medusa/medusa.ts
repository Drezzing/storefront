import { MEDUSA_API_TOKEN, MEDUSA_BACKEND_URL, MEDUSA_PKEY } from "$env/static/private";
import type {
    AdminDiscountsRes,
    StoreCartsRes,
    StoreCollectionsRes,
    StoreOrdersRes,
    StoreProductsRes,
    StoreVariantsRes,
    StoreGetProductCategoriesCategoryRes,
} from "@medusajs/medusa";
import Medusa from "@medusajs/medusa-js";

type EntityExist<K extends string, V> =
    | ({ [P in K]: V } & { err: false })
    | ({ [P in K]: null } & { err: Record<string, unknown> });

export const medusa = new Medusa({
    baseUrl: MEDUSA_BACKEND_URL,
    maxRetries: 3,
    publishableApiKey: MEDUSA_PKEY,
    apiKey: MEDUSA_API_TOKEN,
});

export type MedusaOrder = StoreOrdersRes["order"];
export type MedusaCart = StoreCartsRes["cart"];
export type MedusaDiscount = AdminDiscountsRes["discount"];
export type MedusaCollection = StoreCollectionsRes["collection"];
export type MedusaProduct = StoreProductsRes["product"];
export type MedusaProductVariant = StoreVariantsRes["variant"];
export type MedusaLineItemVariant = MedusaCart["items"][0]["variant"]; // I hate everything about this but it works
export type MedusaVariant = MedusaProductVariant | MedusaLineItemVariant;
//
export type MedusaCategory = StoreGetProductCategoriesCategoryRes["product_category"];
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
    return checkEntityExist<"discount", MedusaDiscount>(id, "discount", (id: string) => {
        if (id?.startsWith("disc_")) {
            return medusa.admin.discounts.retrieve(id);
        } else {
            return medusa.admin.discounts.retrieveByCode(id);
        }
    });
};

export const checkCartExists = async (id?: string) => {
    return checkEntityExist<"cart", MedusaCart>(id, "cart", (id: string) => medusa.carts.retrieve(id));
};

export const checkVariantExists = async (id?: string) => {
    return checkEntityExist<"variant", MedusaProductVariant>(id, "variant", (id: string) =>
        medusa.products.variants.retrieve(id),
    );
};

export const checkOrderExists = async (id?: string) => {
    if (id?.startsWith("cart_")) {
        return checkEntityExist<"order", MedusaOrder>(id, "order", (id: string) => medusa.orders.retrieveByCartId(id));
    } else {
        return checkEntityExist<"order", MedusaOrder>(id, "order", (id: string) => medusa.orders.retrieve(id));
    }
};
