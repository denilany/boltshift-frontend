import type { Product } from "@/types/type";
import {
  buildProductsUrl,
  collectApiItems,
  FEATURED_PRODUCTS_PATH,
  normalizeApiProduct,
  toBooleanValue,
  type ProductApiItem,
} from "@/lib/products/shared";

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const response = await fetch(buildProductsUrl(FEATURED_PRODUCTS_PATH), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch featured products (${response.status})`);
  }

  const payload: unknown = await response.json();

  return collectApiItems(payload)
    .map((item) => item as ProductApiItem)
    .filter((item) => toBooleanValue(item.featured))
    .map((item) => normalizeApiProduct(item))
    .filter((item): item is Product => item !== null);
}
