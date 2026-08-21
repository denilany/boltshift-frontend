import type { Product } from "@/types/type";
import {
  isRecord,
  toIdValue,
  toNumberValue,
} from "@/lib/products/shared";
import { readStoredSession } from "@/lib/auth/storage";
import {
  normalizeWishlistProduct,
  WishlistApiError,
} from "@/lib/wishlist/wishlist-api";

const CART_BASE_URL =
  process.env.NEXT_PUBLIC_CART_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "";

export const CART_PATH = "/api/v1/cart/";
export const CART_ADD_PATH = "/api/v1/cart/add/";
export const CART_UPDATE_PATH = "/api/v1/cart/update/";
export const CART_REMOVE_PATH = "/api/v1/cart/remove/";
export const CART_CLEAR_PATH = "/api/v1/cart/clear/";

export type CartItem = {
  id: number | string | null;
  product: Product;
  quantity: number;
  subtotal: number | null;
};

export type CartState = {
  items: CartItem[];
  itemCount: number;
  totalPrice: number | null;
};

function buildCartUrl(path: string) {
  if (!CART_BASE_URL) {
    return path;
  }

  return `${CART_BASE_URL.replace(/\/$/, "")}${path}`;
}

function extractCartItems(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }

  if (!isRecord(payload)) {
    return [];
  }

  const nested = payload.items;

  return Array.isArray(nested) ? nested.filter(isRecord) : [];
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

function getCartHeaders() {
  const headers = new Headers();
  const session = readStoredSession();

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  return headers;
}

async function requestCart(path: string, init?: RequestInit) {
  const headers = new Headers(getCartHeaders());

  if (init?.headers) {
    new Headers(init.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  const response = await fetch(buildCartUrl(path), {
    cache: "no-store",
    ...init,
    headers,
  });
  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw new WishlistApiError(
      `Cart request failed (${response.status})`,
      response.status,
    );
  }

  return payload;
}

function normalizeCartItem(entry: Record<string, unknown>): CartItem | null {
  const productSource =
    (isRecord(entry.product) && entry.product) ||
    (isRecord(entry.item) && entry.item) ||
    entry;
  const product = normalizeWishlistProduct(productSource);

  if (!product) {
    return null;
  }

  const quantity = Math.max(1, toNumberValue(entry.quantity ?? entry.count ?? 1));
  const subtotalRaw = entry.subtotal ?? entry.sub_total ?? entry.total;

  return {
    id: toIdValue(entry.id) || null,
    product,
    quantity,
    subtotal:
      subtotalRaw === null || subtotalRaw === undefined
        ? null
        : toNumberValue(subtotalRaw),
  };
}

export function normalizeCartResponse(payload: unknown): CartState {
  const items = extractCartItems(payload)
    .map(normalizeCartItem)
    .filter((item): item is CartItem => item !== null);
  const record = isRecord(payload) ? payload : null;
  const itemCount = Math.max(
    items.reduce((count, item) => count + item.quantity, 0),
    toNumberValue(record?.item_count ?? record?.itemCount ?? items.length),
  );
  const totalRaw = record?.total_price ?? record?.totalPrice ?? record?.total;

  return {
    items,
    itemCount,
    totalPrice:
      totalRaw === null || totalRaw === undefined
        ? null
        : toNumberValue(totalRaw),
  };
}

export async function fetchCart() {
  return normalizeCartResponse(await requestCart(CART_PATH));
}

export async function addCartProduct(
  productId: number | string,
  quantity = 1,
) {
  return requestCart(CART_ADD_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export async function updateCartProduct(
  productId: number | string,
  quantity: number,
) {
  return requestCart(`${CART_UPDATE_PATH}${productId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartProduct(productId: number | string) {
  return requestCart(`${CART_REMOVE_PATH}${productId}/`, {
    method: "DELETE",
  });
}

export async function clearCart() {
  return requestCart(CART_CLEAR_PATH, { method: "DELETE" });
}
