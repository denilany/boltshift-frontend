import { readStoredSession } from "@/lib/auth/storage";
import { WishlistApiError } from "@/lib/wishlist/wishlist-api";

const ORDERS_BASE_URL =
  process.env.NEXT_PUBLIC_ORDERS_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "";

export const CHECKOUT_PATH = "/api/v1/orders/checkout/";

export type ShippingAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type CheckoutItem = {
  product_id: number | string;
  quantity: number;
};

export type CheckoutRequest = {
  items: CheckoutItem[];
  address: ShippingAddress;
  coupon_code?: string;
};

function buildOrdersUrl(path: string) {
  if (!ORDERS_BASE_URL) {
    return path;
  }

  return `${ORDERS_BASE_URL.replace(/\/$/, "")}${path}`;
}

function getOrdersHeaders() {
  const headers = new Headers({ "Content-Type": "application/json" });
  const session = readStoredSession();

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  return headers;
}

async function readResponsePayload(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getErrorMessage(payload: unknown, status: number) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const detail = record.detail ?? record.message ?? record.error;

    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    return Object.entries(record)
      .map(([field, value]) => {
        const message = Array.isArray(value) ? value.join(", ") : String(value);
        return `${field}: ${message}`;
      })
      .join("; ");
  }

  return `Checkout request failed (${status})`;
}

export async function checkoutOrder(request: CheckoutRequest) {
  const response = await fetch(buildOrdersUrl(CHECKOUT_PATH), {
    method: "POST",
    headers: getOrdersHeaders(),
    cache: "no-store",
    body: JSON.stringify(request),
  });
  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw new WishlistApiError(
      getErrorMessage(payload, response.status),
      response.status,
    );
  }

  return payload;
}
