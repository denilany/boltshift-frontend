import type { Product } from "@/types/type";
import {
  buildProductsUrl,
  normalizeApiProduct,
  type ProductApiItem,
} from "@/lib/products/shared";

export async function fetchProductById(id: string): Promise<Product | null> {
  const response = await fetch(
    buildProductsUrl(`/api/v1/products/${encodeURIComponent(id)}/`),
    { cache: "no-store" },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch product (${response.status})`);
  }

  return normalizeApiProduct((await response.json()) as ProductApiItem);
}
