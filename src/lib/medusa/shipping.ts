import type { MedusaVariant } from "./medusa";

export type ShippingOption = {
    id: string;
    name: string;
    fulfillment_id: string;
};

export const isVariantShippable = (variant: MedusaVariant): boolean => {
    if (variant.weight && variant.weight > 0) {
        return true;
    }

    if (!variant.product) {
        return false;
    }

    return variant.product.weight !== null && variant.product.weight > 0;
};
