import type { Product } from "@/types/type";
import {
  buildProductsUrl,
  collectApiItems,
  normalizeApiProduct,
  type ProductApiItem,
  ALL_PRODUCTS_PATH,
} from "@/lib/products/shared";

export async function fetchAllProducts(): Promise<Product[]> {
  const response = await fetch(buildProductsUrl(ALL_PRODUCTS_PATH), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products (${response.status})`);
  }

  const payload: unknown = await response.json();

  return collectApiItems(payload)
    .map((item) => item as ProductApiItem)
    .map((item) => normalizeApiProduct(item))
    .filter((item): item is Product => item !== null);
}
