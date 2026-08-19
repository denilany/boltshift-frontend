import { type Product } from "@/types/type";
import {
  buildProductsUrl,
  collectApiItems,
  TRENDING_PRODUCTS_PATH,
  normalizeApiProduct,
  toBooleanValue,
  type ProductApiItem,
} from "@/lib/products/shared";

export type TrendingProductCardProduct = Product & {
  href: string;
};

export async function fetchTrendingProducts() {
  const response = await fetch(buildProductsUrl(TRENDING_PRODUCTS_PATH), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch trending products (${response.status})`);
  }

  const payload: unknown = await response.json();

  const items = collectApiItems(payload)
    .map((item) => item as ProductApiItem)
    .filter((item) => toBooleanValue(item.trending))
    .map((item) => {
      const product = normalizeApiProduct(item);

      if (!product) {
        return null;
      }

      return {
        ...product,
        href: `/catalog/${product.category}/${product.subcategory}/${product.slug ?? product.id}`,
      };
    })
    .filter((item): item is TrendingProductCardProduct => item !== null);

  return items;
}
