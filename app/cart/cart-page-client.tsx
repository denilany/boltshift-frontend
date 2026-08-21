"use client";

import { useEffect, useMemo, useState } from "react";

import { BackButton } from "@/components/back/back";
import { CartItem } from "@/components/cart/cart-item-list";
import { EmptyCart } from "@/components/cart/empty-cart";
import { Footer } from "@/components/footer/footer-section";
import { Navbar, NavbarMobile } from "@/components/navigation/navbar";
import { SectionTitle } from "@/components/section-title";
import {
  cartReducer,
  getCartItems,
  type CartEntry,
} from "@/lib/wishlist/wishlist";
import { GetProductItems } from "@/lib/product-items";
import { OrderSummary } from "@/components/cart-quantity/cart-order-summary";
import { usePersistentCollection } from "@/hooks/use-persistent-collection";
import { CartLoadingSkeleton } from "@/components/collection-loading-skeleton";
import {
  addCartProduct,
  fetchCart,
  removeCartProduct,
  type CartItem as ApiCartItem,
  updateCartProduct,
} from "@/lib/cart/cart-api";

export function CartPageClient() {
  const products = useMemo(() => GetProductItems(), []);
  const {
    value: cart,
    setValue: setCart,
    isHydrated,
  } = usePersistentCollection<CartEntry[]>({
    storageKey: "boltshift:cart",
    fallback: [],
  });
  const [apiCartItems, setApiCartItems] = useState<ApiCartItem[] | null>(null);

  const dispatchCart = (action: Parameters<typeof cartReducer>[1]) => {
    setCart((currentCart) => cartReducer(currentCart, action));
  };

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    let isActive = true;

    void fetchCart()
      .then((response) => {
        if (!isActive) {
          return;
        }

        setApiCartItems(response.items);
        setCart(
          response.items.map(({ product, quantity }) => ({
            productId: product.id,
            quantity,
          })),
        );
      })
      .catch(() => {
        if (isActive) {
          setApiCartItems(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, [isHydrated, setCart]);

  const cartItems = apiCartItems ?? getCartItems(cart, products);

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
          title="Shopping Cart"
          icon="/section-title-icons/Shopping-cart.svg"
          alt="Shopping cart icon"
          className="py-4"
        />

        <div className="flex flex-col gap-10 pb-12">
          {!isHydrated ? (
            <CartLoadingSkeleton />
          ) : cartItems.length > 0 ? (
            <div className="flex w-full flex-wrap items-start justify-center gap-10">
              <div className="grid w-full min-w-0 flex-[1_1_42rem] gap-2">
                <div className="sticky top-24 z-20 hidden border-b border-border/50 bg-background py-1 text-lg font-bold md:flex md:items-center md:justify-between">
                  <span>Item</span>

                  <div className="flex min-w-93.75 items-center gap-4">
                    <span aria-hidden="true" className="h-10 w-10" />
                    <span className="w-24">Subtotal</span>
                    <span className="w-32">Quantity</span>
                  </div>
                </div>

                <div>
                  {cartItems.map(({ product, quantity }) => (
                    <CartItem
                      key={product.id}
                      product={product}
                      quantity={quantity}
                      label={product.variants[0]?.sizes[0] ?? "Default"}
                      colorName={product.variants[0]?.color ?? "Default"}
                      onRemove={() =>
                        (() => {
                          dispatchCart({
                            type: "remove",
                            productId: product.id,
                          });
                          setApiCartItems((currentItems) =>
                            currentItems === null
                              ? currentItems
                              : currentItems.filter(
                                  (item) => item.product.id !== product.id,
                                ),
                          );
                          void removeCartProduct(product.id).catch(() => {});
                        })()
                      }
                      onDecrement={() =>
                        (() => {
                          const nextQuantity = Math.max(1, quantity - 1);
                          dispatchCart({
                            type: "decrement",
                            productId: product.id,
                          });
                          setApiCartItems((currentItems) =>
                            currentItems === null
                              ? currentItems
                              : currentItems.map((item) =>
                                  item.product.id === product.id
                                    ? {
                                        ...item,
                                        quantity: nextQuantity,
                                      }
                                    : item,
                                ),
                          );
                          void updateCartProduct(
                            product.id,
                            nextQuantity,
                          ).catch(() => {});
                        })()
                      }
                      onIncrement={() =>
                        (() => {
                          dispatchCart({
                            type: "increment",
                            productId: product.id,
                          });
                          setApiCartItems((currentItems) =>
                            currentItems === null
                              ? currentItems
                              : currentItems.map((item) =>
                                  item.product.id === product.id
                                    ? {
                                        ...item,
                                        quantity: item.quantity + 1,
                                      }
                                    : item,
                                ),
                          );
                          void addCartProduct(product.id).catch(() => {});
                        })()
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Order summary */}
              <div className="flex w-full justify-center md:flex-[0_1_21rem] md:sticky md:top-24 md:self-start">
                <OrderSummary items={cartItems} />
              </div>
            </div>
          ) : (
            <EmptyCart />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
