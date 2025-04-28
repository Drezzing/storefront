export type FilterOptions = Map<string, Set<string>>; // option -> all values for this option for all products
export type FilterProducts = {
    title: string;
    handle: string;
    thumbnail: string;
    options: Map<string, string[]>; // option -> all values for this option for this product
    prices: Set<number | null>;
}[];

export type FilterData = {
    products: FilterProducts;
    allOptions: FilterOptions;
};
