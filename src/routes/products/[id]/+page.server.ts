import { medusa } from "$lib/medusa";
import type { PageServerLoad } from './$types';

const SIZE_MAP: Record<string, number> = {
    "xs": 1,
    "s": 2,
    "m": 3,
    "l": 4,
    "xl": 5,
}

export const load: PageServerLoad = async ({ params }) => {
    const products = await medusa.products.list({handle: params.id});
    const product = products.products[0];

    const optionMap = new Map<string, string[]>()

    for (const option of product.options ?? []) {
        const optionValues = new Set<string>();
        for (const value of option.values) {
            optionValues.add(value.value)
        }
        optionMap.set(option.title, Array.from(optionValues))
    }

    if (optionMap.has("taille")) {
        optionMap.get("taille")?.sort((a, b) => SIZE_MAP[a] - SIZE_MAP[b]);
    }

    return {
        product: products.products[0],
        options: {
            tarif: optionMap.get("tarif"),
            taille: optionMap.get("taille"),
            couleur: optionMap.get("couleur"),
            // all: optionMap
        }
        // vars : vars.variants
    };
}
