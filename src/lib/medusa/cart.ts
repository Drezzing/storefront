import { z } from "zod";

export const CartAdd = z.object({
    product_id: z.string().startsWith("variant_"),
    quantity: z.number().min(1).max(99),
});

export type CartAdd = z.infer<typeof CartAdd>;

export enum CartButtonState {
    Idle = "Ajouter au panier",
    Updating = "Ajout en cours",
    Success = "Ajouté au panier",
    Fail = "Echec de l'ajout",
}
