import { Product } from "@/types/type";
import {
  persistCollectionRecord,
  readCollectionRecordFromStorage,
} from "@/lib/offline-storage";
import {
  addWishlistProduct,
  fetchWishlist,
  removeWishlistProduct,
} from "@/lib/wishlist-api";

export type WishlistEntry = {
  productId: number | string;
  quantity: number;
};

export type CartEntry = WishlistEntry;

export type WishlistAction =
  | {
      type: "add";
      productId: number | string;
    }
  | {
      type: "increment";
      productId: number | string;
    }
  | {
      type: "decrement";
      productId: number | string;
    }
  | {
      type: "remove";
      productId: number | string;
    }
  | {
      type: "clear";
    };

export const initialWishlist: WishlistEntry[] = [];

export const initialCart: CartEntry[] = [
  { productId: 1, quantity: 1 },
  { productId: 2, quantity: 1 },
];

const WISHLIST_STORAGE_KEY = "boltshift:wishlist";
const CART_STORAGE_KEY = "boltshift:cart";
export const STORED_COLLECTIONS_CHANGED_EVENT = "boltshift:stored-collections-changed";

// Keep localStorage data narrow before trusting it as app state.
function isWishlistEntry(entry: unknown): entry is WishlistEntry {
  return (
    typeof entry === "object" &&
    entry !== null &&
    "productId" in entry &&
    "quantity" in entry &&
    (typeof entry.productId === "number" || typeof entry.productId === "string") &&
    typeof entry.quantity === "number"
  );
}

function notifyStoredCollectionsChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(STORED_COLLECTIONS_CHANGED_EVENT));
}

export function addWishlistItem(
  wishlist: WishlistEntry[],
  productId: number | string,
  quantity = 1,
) {
  const existingItem = wishlist.find((item) => item.productId === productId);

  if (existingItem) {
    return wishlist;
  }

  return [...wishlist, { productId, quantity: Math.max(1, quantity) }];
}

export function readStoredWishlist(fallback = initialWishlist) {
  const storedWishlist = readCollectionRecordFromStorage(
    WISHLIST_STORAGE_KEY,
    fallback,
  ).value;

  return Array.isArray(storedWishlist)
    ? storedWishlist.filter(isWishlistEntry).map((item) => ({
        productId: item.productId,
        quantity: Math.max(1, item.quantity),
      }))
    : fallback;
}

export function writeStoredWishlist(wishlist: WishlistEntry[]) {
  persistCollectionRecord(WISHLIST_STORAGE_KEY, wishlist);
  notifyStoredCollectionsChanged();
}

export function isProductInStoredWishlist(productId: number | string) {
  return readStoredWishlist([]).some((item) => item.productId === productId);
}

export function isProductInStoredCart(productId: number | string) {
  return readStoredCart([]).some((item) => item.productId === productId);
}

export function getCartItems(cart: CartEntry[], products: Product[]) {
  return getWishlistItems(cart, products);
}

export function getWishlistItems(
  wishlist: WishlistEntry[],
  products: Product[],
) {
  return wishlist.flatMap((entry) => {
    const product = products.find((item) => item.id === entry.productId);

    return product ? [{ ...entry, product }] : [];
  });
}

// Return the next saved state so the button can stay synced with storage.
export function toggleProductInStoredWishlist(productId: number | string) {
  const wishlist = readStoredWishlist([]);
  const isSaved = wishlist.some((item) => item.productId === productId);
  const nextWishlist = isSaved
    ? removeWishlistItem(wishlist, productId)
    : addWishlistItem(wishlist, productId);

  writeStoredWishlist(nextWishlist);
  void (isSaved
    ? removeWishlistProduct(productId)
    : addWishlistProduct(productId));

  return !isSaved;
}

export function updateWishlistQuantity(
  wishlist: WishlistEntry[],
  productId: number | string,
  change: number,
) {
  return wishlist.map((item) =>
    item.productId === productId
      ? { ...item, quantity: Math.max(1, item.quantity + change) }
      : item,
  );
}

export function removeWishlistItem(
  wishlist: WishlistEntry[],
  productId: number | string,
) {
  return wishlist.filter((item) => item.productId !== productId);
}

export function wishlistReducer(
  wishlist: WishlistEntry[],
  action: WishlistAction,
) {
  switch (action.type) {
    case "add":
      return addWishlistItem(wishlist, action.productId);
    case "increment":
      return updateWishlistQuantity(wishlist, action.productId, 1);
    case "decrement":
      return updateWishlistQuantity(wishlist, action.productId, -1);
    case "remove":
      return removeWishlistItem(wishlist, action.productId);
    case "clear":
      return [];
    default:
      return wishlist;
  }
}

export function readStoredCart(fallback = initialCart) {
  const storedCart = readCollectionRecordFromStorage(CART_STORAGE_KEY, fallback)
    .value;

  return Array.isArray(storedCart)
    ? storedCart.filter(isWishlistEntry).map((item) => ({
        productId: item.productId,
        quantity: Math.max(1, item.quantity),
      }))
    : fallback;
}

export function writeStoredCart(cart: CartEntry[]) {
  persistCollectionRecord(CART_STORAGE_KEY, cart);
  notifyStoredCollectionsChanged();
}

export function addProductToStoredCart(productId: number | string, quantity = 1) {
  const cart = readStoredCart([]);
  const nextCart = addWishlistToCart(cart, [
    { productId, quantity: Math.max(1, quantity) },
  ]);

  writeStoredCart(nextCart);

  const wishlist = readStoredWishlist([]);

  if (wishlist.some((item) => item.productId === productId)) {
    writeStoredWishlist(removeWishlistItem(wishlist, productId));
    void removeWishlistProduct(productId).catch(() => {});
  }

  return nextCart;
}

export function cartReducer(cart: CartEntry[], action: WishlistAction) {
  switch (action.type) {
    case "add":
      return addWishlistToCart(cart, [
        { productId: action.productId, quantity: 1 },
      ]);
    case "increment":
      return updateWishlistQuantity(cart, action.productId, 1);
    case "decrement":
      return updateWishlistQuantity(cart, action.productId, -1);
    case "remove":
      return removeWishlistItem(cart, action.productId);
    case "clear":
      return [];
    default:
      return cart;
  }
}

export function addWishlistToCart(
  cart: CartEntry[],
  wishlist: WishlistEntry[],
) {
  return wishlist.reduce<CartEntry[]>((nextCart, wishlistItem) => {
    const existingItem = nextCart.find(
      (cartItem) => cartItem.productId === wishlistItem.productId,
    );

    if (!existingItem) {
      return [...nextCart, wishlistItem];
    }

    return nextCart.map((cartItem) =>
      cartItem.productId === wishlistItem.productId
        ? {
            ...cartItem,
            quantity: cartItem.quantity + wishlistItem.quantity,
          }
        : cartItem,
    );
  }, cart);
}

export function getWishlistItemCount(wishlist: WishlistEntry[]) {
  return wishlist.reduce((count, item) => count + item.quantity, 0);
}

export function getCartItemCount(cart: CartEntry[]) {
  return cart.reduce((count, item) => count + item.quantity, 0);
}

export async function syncStoredWishlistFromApi() {
  try {
    const wishlist = await fetchWishlist();
    const nextWishlist = wishlist.items.map((item) => ({
      productId: item.product.id,
      quantity: 1,
    }));

    writeStoredWishlist(nextWishlist);

    return nextWishlist;
  } catch {
    return readStoredWishlist([]);
  }
}
