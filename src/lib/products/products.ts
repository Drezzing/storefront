export type StoreImage = {
    url: string;
    alt: string;
};

export type StoreVariant = {
    id: string;
    options: Set<{ option: string; value: string }>;
    price: number;
    soldout: boolean;
    images: Array<StoreImage>;
};
