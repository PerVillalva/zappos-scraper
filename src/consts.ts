export const LABELS = {
    START: "START",
    PRODUCT: "PRODUCT",
    LIST: "LIST",
};

// 👇 Create an interface strcture with specific object property types
export interface Product {
    url?: string;
    brand: string;
    name?: string;
    SKU: string;
    inStock: boolean;
    onSale: boolean;
    price: string;
    originalPrice?: string;
}
