"use client";

import { useEffect, useState } from "react";

import {
  getCartItemCount,
  getWishlistItemCount,
  readStoredCart,
  readStoredWishlist,
  STORED_COLLECTIONS_CHANGED_EVENT,
} from "@/lib/wishlist/wishlist";

type StoredCollectionCounts = {
  wishlistCount: number;
  cartCount: number;
};

const initialCounts: StoredCollectionCounts = {
  wishlistCount: 0,
  cartCount: 0,
};

export function useStoredCollectionCounts() {
  const [counts, setCounts] = useState<StoredCollectionCounts>(initialCounts);

  useEffect(() => {
    const updateCounts = () => {
      setCounts({
        wishlistCount: getWishlistItemCount(readStoredWishlist([])),
        cartCount: getCartItemCount(readStoredCart([])),
      });
    };

    updateCounts();

    window.addEventListener("storage", updateCounts);
    window.addEventListener(STORED_COLLECTIONS_CHANGED_EVENT, updateCounts);

    return () => {
      window.removeEventListener("storage", updateCounts);
      window.removeEventListener(STORED_COLLECTIONS_CHANGED_EVENT, updateCounts);
    };
  }, []);

  return counts;
}
