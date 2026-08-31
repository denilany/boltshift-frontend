import type { Product } from "@/types/type";
import {
  buildProductsUrl,
  collectApiItems,
  normalizeApiProduct,
  POPULAR_PRODUCTS_PATH,
  toBooleanValue,
  type ProductApiItem,
} from "@/lib/products/shared";

const POPULAR_PRODUCTS_LIMIT = 12;

export async function fetchPopularProducts(): Promise<Product[]> {
  const response = await fetch(buildProductsUrl(POPULAR_PRODUCTS_PATH), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch popular products (${response.status})`);
  }

  const payload: unknown = await response.json();

  return collectApiItems(payload)
    .map((item) => item as ProductApiItem)
    .filter((item) => toBooleanValue(item.popular))
    .map((item) => normalizeApiProduct(item))
    .filter((item): item is Product => item !== null)
    .slice(0, POPULAR_PRODUCTS_LIMIT);
}
