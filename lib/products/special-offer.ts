import type { Product } from "@/types/type";
import {
  buildProductsUrl,
  collectApiItems,
  normalizeApiProduct,
  SPECIAL_OFFER_PRODUCTS_PATH,
  type ProductApiItem,
} from "@/lib/products/shared";

export async function fetchSpecialOfferProduct(): Promise<Product | null> {
  const response = await fetch(buildProductsUrl(SPECIAL_OFFER_PRODUCTS_PATH), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch special offer (${response.status})`);
  }

  const payload: unknown = await response.json();
  const firstItem = collectApiItems(payload)[0];

  return firstItem
    ? normalizeApiProduct(firstItem as ProductApiItem)
    : null;
}
