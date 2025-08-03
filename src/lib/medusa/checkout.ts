import type { Infer, SuperValidated } from "sveltekit-superforms";

import type { ShippingFormSchema, UserInfoFormSchema } from "$lib/schemas/checkout";

import type { MedusaCart } from "./medusa";
import type { ShippingOption } from "./shipping";

export type PriceDetails = {
    order: number;
    shipping: number;
    discount: number;
    total: number;
};

export const getPriceDetails = (cart: MedusaCart): PriceDetails => {
    return {
        order: cart.subtotal!,
        shipping: cart.shipping_total!,
        discount: cart.discount_total!,
        total: cart.total!,
    };
};

export type CheckoutData =
    | {
          cart: true;
          userInfoForm: SuperValidated<Infer<UserInfoFormSchema>>;
          shippingForm: SuperValidated<Infer<ShippingFormSchema>>;
          shippingOptions: ShippingOption[];
          priceDetails: PriceDetails;
      }
    | {
          cart: false;
          userInfoForm: null;
          shippingForm: null;
          shippingOptions: null;
          priceDetails: null;
      };
