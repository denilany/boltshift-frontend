"use client";

import { useEffect, useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { Footer } from "@/components/footer/footer-section";
import { Navbar, NavbarMobile } from "@/components/navigation/navbar";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { EmptyWishlist } from "@/components/wishlist/ wishlist-item-card";
import { WishlistItem } from "@/components/wishlist/wishlist-item-list";
import { GetProductItems } from "@/lib/product-items";
import { BackButton } from "@/components/back/back";
import {
  addWishlistToCart,
  getWishlistItems,
  readStoredCart,
  writeStoredCart,
  type WishlistEntry,
  wishlistReducer,
} from "@/lib/wishlist/wishlist";
import {
  showSonnerMessage,
  type SonnerMessageProps,
} from "@/components/alert/alert";
import { usePersistentCollection } from "@/hooks/use-persistent-collection";
import { WishlistLoadingSkeleton } from "@/components/collection-loading-skeleton";
import { updateCartProduct } from "@/lib/cart/cart-api";
import {
  addWishlistProduct,
  fetchWishlist,
  moveWishlistProductToCart,
  removeWishlistProduct,
  type WishlistItem as ApiWishlistItem,
} from "@/lib/wishlist/wishlist-api";

export function WishlistPageClient() {
  const products = useMemo(() => GetProductItems(), []);
  const {
    value: wishlist,
    setValue: setWishlist,
    isHydrated,
  } = usePersistentCollection<WishlistEntry[]>({
    storageKey: "boltshift:wishlist",
    fallback: [],
  });
  const [apiWishlistItems, setApiWishlistItems] = useState<
    ApiWishlistItem[] | null
  >(null);
  const [apiWishlistQuantities, setApiWishlistQuantities] = useState<
    Record<string, number>
  >({});
  const [isApiWishlistReady, setIsApiWishlistReady] = useState(false);

  const dispatchWishlist = (action: Parameters<typeof wishlistReducer>[1]) => {
    setWishlist((currentWishlist) => wishlistReducer(currentWishlist, action));
  };

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    let isActive = true;
    setIsApiWishlistReady(false);

    void fetchWishlist()
      .then((response) => {
        if (!isActive) {
          return;
        }

        if (response.items.length > 0) {
          setApiWishlistItems(response.items);
          setApiWishlistQuantities(
            Object.fromEntries(
              response.items.map(({ product }) => {
                const storedQuantity = wishlist.find(
                  (item) => item.productId === product.id,
                )?.quantity;

                return [String(product.id), Math.max(1, storedQuantity ?? 1)];
              }),
            ),
          );
          return;
        }

        // Fall back to the locally stored wishlist when the API returns nothing.
        setApiWishlistItems(null);
        setApiWishlistQuantities({});
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setApiWishlistItems(null);
      })
      .finally(() => {
        if (!isActive) {
          return;
        }

        setIsApiWishlistReady(true);
      });

    return () => {
      isActive = false;
    };
  }, [isHydrated]);

  const localWishlistItems = getWishlistItems(wishlist, products);
  const hasApiWishlistItems =
    isApiWishlistReady && apiWishlistItems !== null && apiWishlistItems.length > 0;
  const wishlistCount = hasApiWishlistItems
    ? apiWishlistItems.length
    : localWishlistItems.length;
  const visibleWishlistEntries = hasApiWishlistItems
    ? apiWishlistItems.map(({ product }) => ({
        productId: product.id,
        quantity: apiWishlistQuantities[String(product.id)] ?? 1,
      }))
    : wishlist;
  const clearVisibleWishlist = () => {
    dispatchWishlist({ type: "clear" });
    setApiWishlistQuantities({});
    setApiWishlistItems((currentItems) =>
      currentItems === null ? currentItems : [],
    );
  };

  const removeItemFromWishlist = (productId: number | string) => {
    dispatchWishlist({ type: "remove", productId });
    setApiWishlistItems((currentItems) =>
      currentItems === null
        ? currentItems
        : currentItems.filter((item) => item.product.id !== productId),
    );
    setApiWishlistQuantities((currentQuantities) => {
      const nextQuantities = { ...currentQuantities };
      delete nextQuantities[String(productId)];
      return nextQuantities;
    });
    void removeWishlistProduct(productId).catch(() => {});
  };

  const incrementWishlistItem = (productId: number | string) => {
    if (hasApiWishlistItems) {
      setApiWishlistQuantities((currentQuantities) => ({
        ...currentQuantities,
        [String(productId)]: (currentQuantities[String(productId)] ?? 1) + 1,
      }));
      setWishlist((currentWishlist) => {
        const existingItem = currentWishlist.find(
          (item) => item.productId === productId,
        );

        return existingItem
          ? currentWishlist.map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            )
          : [...currentWishlist, { productId, quantity: 2 }];
      });
    } else {
      dispatchWishlist({ type: "increment", productId });
    }

    if (hasApiWishlistItems) {
      void addWishlistProduct(productId).catch(() => {});
    }
  };

  const decrementWishlistItem = (
    productId: number | string,
    quantity: number,
  ) => {
    if (quantity <= 1) {
      return;
    }

    if (hasApiWishlistItems) {
      setApiWishlistQuantities((currentQuantities) => ({
        ...currentQuantities,
        [String(productId)]: quantity - 1,
      }));
      setWishlist((currentWishlist) =>
        currentWishlist.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item,
        ),
      );
    } else {
      dispatchWishlist({ type: "decrement", productId });
    }
  };

  const addAllToCart = () => {
    writeStoredCart(
      addWishlistToCart(readStoredCart([]), visibleWishlistEntries),
    );
    clearVisibleWishlist();

    if (hasApiWishlistItems) {
      void Promise.all(
        visibleWishlistEntries.map(({ productId, quantity }) =>
          moveWishlistProductToCart(productId).then(() =>
            updateCartProduct(productId, quantity),
          ),
        ),
      ).catch(() => {});
    }
  };

  const addItemToCart = (productId: number | string, quantity: number) => {
    writeStoredCart(
      addWishlistToCart(readStoredCart([]), [{ productId, quantity }]),
    );

    if (hasApiWishlistItems) {
      void moveWishlistProductToCart(productId)
        .then(() => updateCartProduct(productId, quantity))
        .catch(() => {});
    }

    dispatchWishlist({ type: "remove", productId });
    setApiWishlistItems((currentItems) =>
      currentItems === null
        ? currentItems
        : currentItems.filter((item) => item.product.id !== productId),
    );
  };

  // Sonnar message when all wishlist items are added to cart
  const notification: SonnerMessageProps = {
    variant: "success",
    title: "All Items Added Successfully",
    description: "Checkout the cart and proceed to complete your order.",
    iconSrc: "/sonnar/Green-Featured-outline.svg",
  };

  const handleConfirm = () => {
    addAllToCart();

    showSonnerMessage(notification);
  };

  return (
    <div className="overflow-x-clip">
      <div>
        <div className="hidden md:block">
          <Navbar />
        </div>
        <div className="block md:hidden">
          <NavbarMobile showFilterButton={false} />
        </div>
      </div>

      <main className="mx-auto w-full">
        <div className="py-4">
          <BackButton />
        </div>

        <SectionTitle
          title="Wishlist"
          icon="/section-title-icons/HeartWithRibbon.svg"
          alt="Heart with ribbon icon"
          className="py-4"
        />

        <div className="flex flex-col gap-10 pb-12">
          {!isHydrated || !isApiWishlistReady ? (
            <WishlistLoadingSkeleton />
          ) : wishlistCount > 0 ? (
            <div className="grid gap-2">
              <div className="sticky top-24 z-20 hidden border-b border-border/50 bg-background py-1 text-lg font-bold md:flex md:items-center md:justify-between">
                <span>Item</span>

                <div className="flex min-w-93.75 items-center gap-4">
                  <span aria-hidden="true" className="h-10 w-10" />
                  <span className="w-24">Subtotal</span>
                  <span className="w-32">Quantity</span>
                </div>
              </div>

              <div>
                {hasApiWishlistItems
                  ? apiWishlistItems.map(({ product }) => (
                      <WishlistItem
                        key={product.id}
                        product={product}
                        quantity={apiWishlistQuantities[String(product.id)] ?? 1}
                        label={product.variants[0]?.sizes[0] ?? "Default"}
                        colorName={product.variants[0]?.color ?? "Default"}
                        onRemove={() => removeItemFromWishlist(product.id)}
                        onDecrement={() =>
                          decrementWishlistItem(
                            product.id,
                            apiWishlistQuantities[String(product.id)] ?? 1,
                          )
                        }
                        onIncrement={() => incrementWishlistItem(product.id)}
                        onAddToCart={(quantity) =>
                          addItemToCart(product.id, quantity)
                        }
                      />
                    ))
                  : localWishlistItems.map(({ product, quantity }) => (
                      <WishlistItem
                        key={product.id}
                        product={product}
                        quantity={quantity}
                        label={product.variants[0]?.sizes[0] ?? "Default"}
                        colorName={product.variants[0]?.color ?? "Default"}
                        onRemove={() => removeItemFromWishlist(product.id)}
                        onDecrement={() =>
                          decrementWishlistItem(product.id, quantity)
                        }
                        onIncrement={() => incrementWishlistItem(product.id)}
                        onAddToCart={(quantity) =>
                          addItemToCart(product.id, quantity)
                        }
                      />
                    ))}
              </div>

              <div className="grid w-full justify-items-stretch sm:py-4">
                <Button
                  className="w-full justify-self-end px-4.5 py-3 sm:max-w-88"
                  onClick={handleConfirm}
                >
                  <ShoppingCart className="size-4" />
                  Add All To Cart
                </Button>
              </div>
            </div>
          ) : (
            <EmptyWishlist />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
