"use client";

import { useEffect, useState } from "react";

import {
  isProductInStoredCart,
  STORED_COLLECTIONS_CHANGED_EVENT,
} from "@/lib/wishlist";

export function useStoredCartItem(productId: number | string) {
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    const updateCartStatus = () => {
      setIsInCart(isProductInStoredCart(productId));
    };

    updateCartStatus();

    window.addEventListener("storage", updateCartStatus);
    window.addEventListener(STORED_COLLECTIONS_CHANGED_EVENT, updateCartStatus);

    return () => {
      window.removeEventListener("storage", updateCartStatus);
      window.removeEventListener(
        STORED_COLLECTIONS_CHANGED_EVENT,
        updateCartStatus,
      );
    };
  }, [productId]);

  return isInCart;
}
