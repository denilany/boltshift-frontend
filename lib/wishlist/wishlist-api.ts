import type { Product, Variant } from "@/types/type";
import {
  DEFAULT_PRODUCT_IMAGE,
  isRecord,
  slugify,
  toIdValue,
  toNumberValue,
  toStringValue,
} from "@/lib/products/shared";
import { readStoredSession } from "@/lib/auth/storage";

const WISHLIST_BASE_URL =
  process.env.NEXT_PUBLIC_WISHLIST_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "";

export const WISHLIST_PATH = "/api/v1/wishlist/";
export const WISHLIST_ADD_PATH = "/api/v1/wishlist/add/";
export const WISHLIST_REMOVE_PATH = "/api/v1/wishlist/remove/";
export const WISHLIST_MOVE_TO_CART_PATH =
  "/api/v1/wishlist/move-to-cart/";

export type WishlistApiItem = {
  id?: unknown;
  product?: unknown;
  created_at?: unknown;
  createdAt?: unknown;
  added_at?: unknown;
  addedAt?: unknown;
  timestamp?: unknown;
  item?: unknown;
};

export type WishlistItem = {
  id: number | string | null;
  createdAt: string | null;
  product: Product;
};

export type WishlistState = {
  items: WishlistItem[];
  itemCount: number;
};

export type WishlistApiErrorShape = {
  message: string;
  status: number;
  fieldErrors?: Record<string, string[]>;
};

export class WishlistApiError extends Error {
  status: number;

  fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "WishlistApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function buildWishlistUrl(path: string) {
  if (!WISHLIST_BASE_URL) {
    return path;
  }

  return `${WISHLIST_BASE_URL.replace(/\/$/, "")}${path}`;
}

function isWishlistRecord(value: unknown): value is Record<string, unknown> {
  return isRecord(value);
}

function normalizeVariants(value: unknown): Variant[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!isWishlistRecord(entry)) {
      return [];
    }

    const color = toStringValue(entry.color ?? entry.colour ?? entry.name);
    const sizesRaw = entry.sizes ?? entry.size ?? entry.options;
    const sizes = Array.isArray(sizesRaw)
      ? sizesRaw.flatMap((size) => {
          if (typeof size === "string") {
            return [size];
          }

          if (isWishlistRecord(size) && typeof size.value === "string") {
            return [size.value];
          }

          return [];
        })
      : [];

    return [
      {
        color: color || "Default",
        sizes: sizes.filter(Boolean),
      },
    ];
  });
}

export function normalizeWishlistProduct(item: unknown): Product | null {
  if (!isWishlistRecord(item)) {
    return null;
  }

  const name = toStringValue(item.name ?? item.title);
  const slug = toStringValue(item.slug) || slugify(name);
  const imageList = Array.isArray(item.images)
    ? item.images.flatMap((image) =>
        typeof image === "string" ? [image] : [],
      )
    : [];
  const primaryImage =
    imageList[0] ||
    toStringValue(item.image) ||
    toStringValue(item.primary_image) ||
    toStringValue(item.thumbnail) ||
    DEFAULT_PRODUCT_IMAGE;
  const categoryLabel = toStringValue(item.category);
  const subcategoryLabel = toStringValue(item.subcategory);

  if (!name) {
    return null;
  }

  return {
    id: toIdValue(item.id) || slug,
    slug,
    images: imageList.length > 0 ? imageList : [primaryImage],
    name,
    description: toStringValue(item.excerpt ?? item.description),
    price: toNumberValue(item.price),
    progress: toNumberValue(item.progress),
    itemsLeft: toNumberValue(item.items_left ?? item.itemsLeft),
    ratings: toNumberValue(item.average_rating ?? item.ratings),
    reviews: toNumberValue(item.review_count ?? item.reviews),
    brand: toStringValue(item.brand),
    category: (slugify(categoryLabel || "catalog") as Product["category"]),
    subcategory: (
      slugify(subcategoryLabel || categoryLabel || "products") as Product["subcategory"]
    ),
    vendor: toStringValue(item.vendor_name ?? item.vendor),
    variants: normalizeVariants(item.variants),
  };
}

function extractWishlistItems(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter(isWishlistRecord);
  }

  if (!isWishlistRecord(payload)) {
    return [];
  }

  const nested =
    payload.items ??
    payload.results ??
    payload.data ??
    payload.wishlist_items ??
    payload.wishlistItems;

  if (Array.isArray(nested)) {
    return nested.filter(isWishlistRecord);
  }

  return [payload];
}

function normalizeWishlistItem(entry: unknown): WishlistItem | null {
  if (!isWishlistRecord(entry)) {
    return null;
  }

  const productSource =
    (isWishlistRecord(entry.product) && entry.product) ||
    (isWishlistRecord(entry.item) && entry.item) ||
    entry;
  const product = normalizeWishlistProduct(productSource);

  if (!product) {
    return null;
  }

  const createdAt =
    toStringValue(entry.created_at) ||
    toStringValue(entry.createdAt) ||
    toStringValue(entry.added_at) ||
    toStringValue(entry.addedAt) ||
    toStringValue(entry.timestamp) ||
    null;

  return {
    id: toIdValue(entry.id) || null,
    createdAt,
    product,
  };
}

function extractErrorMessage(payload: unknown, fallback: string) {
  if (!isWishlistRecord(payload)) {
    return fallback;
  }

  const message =
    payload.detail ??
    payload.message ??
    payload.error ??
    payload.non_field_errors;

  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message)) {
    const first = message.find((item) => typeof item === "string");

    if (typeof first === "string") {
      return first;
    }
  }

  return fallback;
}

function extractFieldErrors(payload: unknown) {
  if (!isWishlistRecord(payload)) {
    return undefined;
  }

  const fieldErrors: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (["detail", "message", "error", "non_field_errors"].includes(key)) {
      continue;
    }

    if (typeof value === "string") {
      fieldErrors[key] = [value];
      continue;
    }

    if (Array.isArray(value)) {
      const messages = value.flatMap((entry) =>
        typeof entry === "string" ? [entry] : [],
      );

      if (messages.length > 0) {
        fieldErrors[key] = messages;
      }
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

async function readResponsePayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getWishlistHeaders() {
  const headers = new Headers();
  const session = readStoredSession();

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  return headers;
}

async function requestWishlist(path: string, init?: RequestInit) {
  const headers = new Headers(getWishlistHeaders());

  if (init?.headers) {
    new Headers(init.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  const response = await fetch(buildWishlistUrl(path), {
    cache: "no-store",
    ...init,
    headers,
  });

  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw new WishlistApiError(
      extractErrorMessage(payload, `Wishlist request failed (${response.status})`),
      response.status,
      extractFieldErrors(payload),
    );
  }

  return payload;
}

export function normalizeWishlistResponse(payload: unknown): WishlistState {
  const items = extractWishlistItems(payload)
    .map((item) => normalizeWishlistItem(item))
    .filter((item): item is WishlistItem => item !== null);

  const itemCountRaw = isWishlistRecord(payload)
    ? payload.item_count ?? payload.itemCount ?? payload.count
    : null;
  const normalizedCount =
    itemCountRaw === null || itemCountRaw === undefined
      ? items.length
      : toNumberValue(itemCountRaw);

  return {
    items,
    itemCount: Math.max(items.length, normalizedCount),
  };
}

export async function fetchWishlist(): Promise<WishlistState> {
  const payload = await requestWishlist(WISHLIST_PATH);

  return normalizeWishlistResponse(payload);
}

export async function addWishlistProduct(productId: number | string) {
  return requestWishlist(WISHLIST_ADD_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: productId,
    }),
  });
}

export async function removeWishlistProduct(productId: number | string) {
  return requestWishlist(`${WISHLIST_REMOVE_PATH}${productId}/`, {
    method: "DELETE",
  });
}

export async function moveWishlistProductToCart(productId: number | string) {
  return requestWishlist(`${WISHLIST_MOVE_TO_CART_PATH}${productId}/`, {
    method: "POST",
  });
}

export function isWishlistServiceUnavailable(error: unknown) {
  return error instanceof WishlistApiError && error.status === 503;
}

export function isWishlistAuthError(error: unknown) {
  return error instanceof WishlistApiError && [401, 403].includes(error.status);
}
