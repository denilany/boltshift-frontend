import type { Product } from "@/types/type";

const PRODUCTS_BASE_URL =
  process.env.NEXT_PUBLIC_PRODUCTS_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "";

export const ALL_PRODUCTS_PATH = "/api/v1/products/";
export const TRENDING_PRODUCTS_PATH = "/api/v1/products/trending/";
export const HOT_DEALS_TODAY_PATH = "/api/v1/products/hot-deals-today/";
export const FEATURED_PRODUCTS_PATH = "/api/v1/products/featured/";
export const POPULAR_PRODUCTS_PATH = "/api/v1/products/popular/";
export const DEFAULT_PRODUCT_IMAGE = "/products.jpg";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function toStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function toIdValue(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}

export function toNumberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function toBooleanValue(value: unknown) {
  return value === true;
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildProductsUrl(path: string) {
  if (!PRODUCTS_BASE_URL) {
    return path;
  }

  return `${PRODUCTS_BASE_URL.replace(/\/$/, "")}${path}`;
}

export function collectApiItems(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }

  if (isRecord(payload)) {
    const nested = payload.results ?? payload.data ?? payload.items;

    if (Array.isArray(nested)) {
      return nested.filter(isRecord);
    }

    return [payload];
  }

  return [];
}

export type ProductApiItem = {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  price?: unknown;
  discount_percent?: unknown;
  excerpt?: unknown;
  average_rating?: unknown;
  review_count?: unknown;
  new_arrival?: unknown;
  trending?: unknown;
  hot_deal_today?: unknown;
  featured?: unknown;
  popular?: unknown;
  primary_image?: unknown;
  category?: unknown;
  subcategory?: unknown;
  brand?: unknown;
  vendor_name?: unknown;
};

export function normalizeApiProduct(
  item: ProductApiItem,
): Product | null {
  const name = toStringValue(item.name);
  const slug = toStringValue(item.slug) || slugify(name);

  if (!name || !slug) {
    return null;
  }

  const categoryLabel = toStringValue(item.category);
  const subcategoryLabel = toStringValue(item.subcategory);
  const categorySlug = slugify(categoryLabel || "catalog");
  const subcategorySlug = slugify(subcategoryLabel || categoryLabel || "products");

  return {
    id: toIdValue(item.id) || slug,
    slug,
    images: [toStringValue(item.primary_image) || DEFAULT_PRODUCT_IMAGE],
    name,
    description: toStringValue(item.excerpt),
    price: toNumberValue(item.price),
    progress: 0,
    itemsLeft: 0,
    ratings: toNumberValue(item.average_rating),
    reviews: toNumberValue(item.review_count),
    brand: toStringValue(item.brand),
    category: categorySlug as Product["category"],
    subcategory: subcategorySlug as Product["subcategory"],
    vendor: toStringValue(item.vendor_name),
    variants: [],
  };
}
