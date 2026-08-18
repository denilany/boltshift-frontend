import type { Product } from "@/types/type";

const PRODUCTS_BASE_URL =
  process.env.NEXT_PUBLIC_PRODUCTS_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "";
export const TRENDING_PRODUCTS_PATH = "/api/v1/products/trending/";
export const TRENDING_PRODUCTS_FALLBACK_IMAGE = "/catalog/beauty.png";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toNumberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toBooleanValue(value: unknown) {
  return value === true;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildProductsUrl(path: string) {
  if (!PRODUCTS_BASE_URL) {
    return path;
  }

  return `${PRODUCTS_BASE_URL.replace(/\/$/, "")}${path}`;
}

export type TrendingProductApiItem = {
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
  primary_image?: unknown;
  category?: unknown;
  subcategory?: unknown;
  brand?: unknown;
  vendor_name?: unknown;
};

export type TrendingProductCardProduct = Product & {
  href: string;
};

function normalizeProductItem(
  item: TrendingProductApiItem,
): TrendingProductCardProduct | null {
  const name = toStringValue(item.name);
  const slug = toStringValue(item.slug);

  if (!name || !slug) {
    return null;
  }

  const categoryLabel = toStringValue(item.category);
  const subcategoryLabel = toStringValue(item.subcategory);
  const categorySlug = slugify(categoryLabel || "catalog");
  const subcategorySlug = slugify(subcategoryLabel || categoryLabel || "products");
  const price = toNumberValue(item.price);
  const image =
    toStringValue(item.primary_image) || TRENDING_PRODUCTS_FALLBACK_IMAGE;
  const id = toStringValue(item.id) || slug;
  const rating = toNumberValue(item.average_rating);
  const reviewCount = toNumberValue(item.review_count);
  const vendor = toStringValue(item.vendor_name);
  const brand = toStringValue(item.brand);

  return {
    id,
    slug,
    href: `/catalog/${categorySlug}/${subcategorySlug}/${slug}`,
    images: [image],
    name,
    description: toStringValue(item.excerpt),
    price,
    progress: 0,
    itemsLeft: 0,
    ratings: rating,
    reviews: reviewCount,
    brand,
    category: categorySlug as Product["category"],
    subcategory: subcategorySlug as Product["subcategory"],
    vendor,
    variants: [],
  };
}

function collectTrendingItems(payload: unknown): TrendingProductApiItem[] {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord) as TrendingProductApiItem[];
  }

  if (isRecord(payload)) {
    const nested = payload.results ?? payload.data ?? payload.items;

    if (Array.isArray(nested)) {
      return nested.filter(isRecord) as TrendingProductApiItem[];
    }

    return [payload as TrendingProductApiItem];
  }

  return [];
}

export async function fetchTrendingProducts() {
  const response = await fetch(buildProductsUrl(TRENDING_PRODUCTS_PATH), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch trending products (${response.status})`);
  }

  const payload: unknown = await response.json();

  const items = collectTrendingItems(payload)
    .filter(isRecord)
    .filter((item) => toBooleanValue(item.trending))
    .map((item) => normalizeProductItem(item))
    .filter((item): item is TrendingProductCardProduct => item !== null);

  return items;
}
