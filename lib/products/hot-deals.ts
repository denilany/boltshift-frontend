import type { Product } from "@/types/type";
import {
  buildProductsUrl,
  collectApiItems,
  HOT_DEALS_TODAY_PATH,
  normalizeApiProduct,
  toBooleanValue,
  type ProductApiItem,
} from "@/lib/products/shared";

const HOT_DEALS_LIMIT = 8;  

export async function fetchHotDealTodayProducts(): Promise<Product[]> {
  const response = await fetch(buildProductsUrl(HOT_DEALS_TODAY_PATH), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch hot deals (${response.status})`);
  }

  const payload: unknown = await response.json();

  return collectApiItems(payload)
    .map((item) => item as ProductApiItem)
    .filter((item) => toBooleanValue(item.hot_deal_today))
    .map((item) => normalizeApiProduct(item))
    .filter((item): item is Product => item !== null)
    .slice(0, HOT_DEALS_LIMIT);
}
