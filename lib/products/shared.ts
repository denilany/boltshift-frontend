import type { Product, Review } from "@/types/type";

const PRODUCTS_BASE_URL =
  process.env.NEXT_PUBLIC_PRODUCTS_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "";

export const ALL_PRODUCTS_PATH = "/api/v1/products/";
export const TRENDING_PRODUCTS_PATH = "/api/v1/products/trending/";
export const HOT_DEALS_TODAY_PATH = "/api/v1/products/hot-deals-today/";
export const FEATURED_PRODUCTS_PATH = "/api/v1/products/featured/";
export const POPULAR_PRODUCTS_PATH = "/api/v1/products/popular/";
export const SPECIAL_OFFER_PRODUCTS_PATH = "/api/v1/products/special-offer/";
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
  sku?: unknown;
  price?: unknown;
  discount_percent?: unknown;
  excerpt?: unknown;
  description?: unknown;
  average_rating?: unknown;
  review_count?: unknown;
  new_arrival?: unknown;
  trending?: unknown;
  hot_deal_today?: unknown;
  featured?: unknown;
  popular?: unknown;
  special_offer?: unknown;
  primary_image?: unknown;
  images?: unknown;
  category?: unknown;
  subcategory?: unknown;
  brand?: unknown;
  vendor_name?: unknown;
  vendor?: unknown;
  inventory?: unknown;
  variant_groups?: unknown;
  specifications?: unknown;
  reviews?: unknown;
};

function nestedString(value: unknown, key: string) {
  return isRecord(value) ? toStringValue(value[key]) : "";
}

function normalizeImages(item: ProductApiItem) {
  const images = Array.isArray(item.images)
    ? item.images.filter((image): image is string => typeof image === "string")
    : [];
  const primaryImage = toStringValue(item.primary_image);

  return images.length > 0
    ? images
    : [primaryImage || DEFAULT_PRODUCT_IMAGE];
}

function normalizeVariants(item: ProductApiItem) {
  if (!Array.isArray(item.variant_groups)) {
    return [];
  }

  return item.variant_groups.flatMap((group) => {
    if (!isRecord(group) || !Array.isArray(group.options)) {
      return [];
    }

    return group.options
      .filter(isRecord)
      .map((option) => toStringValue(option.value))
      .filter(Boolean)
      .map((value) => ({ color: value, sizes: [value] }));
  });
}

export function normalizeApiProduct(
  item: ProductApiItem,
): Product | null {
  const name = toStringValue(item.name);
  const slug = toStringValue(item.slug) || slugify(name);

  if (!name || !slug) {
    return null;
  }

  const categoryLabel =
    toStringValue(item.category) || nestedString(item.category, "name");
  const subcategoryLabel =
    toStringValue(item.subcategory) || nestedString(item.subcategory, "name");
  const categorySlug = slugify(categoryLabel || "catalog");
  const subcategorySlug = slugify(subcategoryLabel || categoryLabel || "products");
  const inventory = isRecord(item.inventory) ? item.inventory : undefined;
  const itemsLeft = toNumberValue(inventory?.remaining_items);
  const totalItems = toNumberValue(inventory?.total_items);
  const specifications = isRecord(item.specifications)
    ? Object.fromEntries(
        Object.entries(item.specifications).map(([key, value]) => [
          key,
          toStringValue(value),
        ]),
      )
    : undefined;

  const product: Product = {
    id: toIdValue(item.id) || slug,
    slug,
    images: normalizeImages(item),
    name,
    excerpt: toStringValue(item.excerpt),
    description:
      toStringValue(item.description) || toStringValue(item.excerpt),
    sku: toStringValue(item.sku),
    specifications,
    price: toNumberValue(item.price),
    progress: totalItems > 0 ? (itemsLeft / totalItems) * 100 : 0,
    itemsLeft,
    ratings: toNumberValue(item.average_rating),
    reviews: toNumberValue(item.review_count),
    discountPercent: toNumberValue(item.discount_percent),
    newArrival: toBooleanValue(item.new_arrival),
    trending: toBooleanValue(item.trending),
    hotDealToday: toBooleanValue(item.hot_deal_today),
    featured: toBooleanValue(item.featured),
    popular: toBooleanValue(item.popular),
    specialOffer: toBooleanValue(item.special_offer),
    brand: toStringValue(item.brand) || nestedString(item.brand, "name"),
    category: categorySlug as Product["category"],
    subcategory: subcategorySlug as Product["subcategory"],
    vendor:
      toStringValue(item.vendor_name) || nestedString(item.vendor, "store_name"),
    variants: normalizeVariants(item),
  };

  product.reviewItems = Array.isArray(item.reviews)
    ? item.reviews.filter(isRecord).map((review) => ({
        id: toIdValue(review.id),
        name: `Buyer ${toIdValue(review.user) || ""}`.trim(),
        date: toStringValue(review.created_at).split("T")[0] || "",
        rating: toNumberValue(review.rating),
        reviewHeading: toStringValue(review.title),
        reviewText: toStringValue(review.body),
        productUploads: Array.isArray(review.images)
          ? review.images.filter(
              (image): image is string => typeof image === "string",
            )
          : [],
        reactions: {
          likes: toNumberValue(review.likes),
          dislikes: toNumberValue(review.dislikes),
        },
        product: {
          id: product.id,
          name: product.name,
          image: product.images[0],
          price: product.price,
          category: product.category,
          subcategory: product.subcategory,
          vendor: product.vendor,
        },
      } satisfies Review))
    : [];

  return product;
}
