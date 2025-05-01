export type FilterProducts = {
    title: string;
    handle: string;
    thumbnail: string;
    options: Map<string, string[]>; // option -> all values for this option for this product
    prices: Set<number | null>;
}[];

export type FilterType = "collection" | "category";
