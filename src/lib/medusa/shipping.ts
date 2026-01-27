import type { LineItem } from "@medusajs/medusa";

import { handleError } from "$lib/error";
import { medusa, type MedusaVariant } from "$lib/medusa/medusa";

export type ShippingOption = {
    id: string;
    name: string;
    price: string;
    fulfillment_id: string;
    disabled: boolean;
};

/**
 * Get the shipping options available for a given cart.
 * @param cartId The ID of the cart.
 * @returns List of shipping options with their details.
 */
export const getShippingOptionsForCart = async (cartId: string) => {
    const so = await medusa.shippingOptions.listCartOptions(cartId).catch((err) => {
        return handleError(500, "GET_SHIPPING_OPTIONS_FOR_CART.LIST_CART_OPTIONS_FAILED", {
            error: err.response.data,
            cartId,
        });
    });

    const shippingOptions = so.shipping_options.map((option) => {
        const optionPrice = (option.price_incl_tax ?? 0) / 100;
        if (option.data === undefined || typeof option.data.id !== "string") {
            return handleError(500, "CHECKOUT_LOAD_ACTION.SHIPPING_FULFILMENT_ID_MISSING", {
                id: option.id,
                name: option.name,
                data: option.data,
                cartId,
            });
        }
        return {
            id: option.id!,
            name: option.name!,
            price: optionPrice ? `${optionPrice.toFixed(2)}€` : "Gratuite",
            fulfillment_id: option.data.id,
            disabled: optionPrice < 0,
        };
    });

    return shippingOptions;
};

/**
 * Check if a variant is shippable based on its weight or its product's weight.
 * A variant is considered shippable if it has a weight greater than zero,
 * or if its associated product has a weight greater than zero.
 * @param variant Variant to check.
 * @returns True if the variant is shippable, otherwise false.
 */
export const isVariantShippable = (variant: MedusaVariant): boolean => {
    if (variant.weight && variant.weight > 0) {
        return true;
    }

    if (!variant.product) {
        return false;
    }

    return variant.product.weight !== null && variant.product.weight > 0;
};

/**
 * Check which products in the cart are shippable.
 * @param lineItems Items in the cart.
 * @returns An object mapping product variant titles to their shippable status.
 */
export const getShippableProductsForCart = (lineItems: LineItem[]) => {
    const shippableProducts: { [variant: string]: boolean } = {};
    for (const item of lineItems) {
        if (item.variant) {
            const productTitle = `${item.variant.product!.title} (${item.variant.title})`;
            shippableProducts[productTitle] = isVariantShippable(item.variant);
        }
    }

    return shippableProducts;
};
