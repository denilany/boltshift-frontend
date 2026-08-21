"use client";

import { useMemo, useState } from "react";

import { Navbar, NavbarMobile } from "@/components/navigation/navbar";
import { Footer } from "@/components/footer/footer-section";
import { SectionTitle } from "@/components/section-title";
import { BackButton } from "@/components/back/back";
import { CheckoutProductCard } from "@/components/checkout/checkout-product-spec";
import { GetProductItems } from "@/lib/product-items";
import { cartReducer, getCartItems, type CartEntry } from "@/lib/wishlist/wishlist";
import { PersonalDetailsCard } from "@/components/checkout/personal-details";
import { ShippingDetailsCard } from "@/components/checkout/shipping-details";
import { ShippingMethodCard } from "@/components/checkout/shipping-method-card";
import { OrderSummary } from "@/components/cart-quantity/cart-order-summary";
import { PaymentMethodCard } from "@/components/checkout/payment-method";
import { OrderCompletionModal } from "@/components/checkout/order-completion-modal";
import { DashedSeparator } from "@/components/separator/dashed-separator";
import { usePersistentCollection } from "@/hooks/use-persistent-collection";
import { CheckoutSummarySkeleton } from "@/components/collection-loading-skeleton";
import {
  addCartProduct,
  clearCart,
  removeCartProduct,
  updateCartProduct,
} from "@/lib/cart/cart-api";

type CheckoutPageClientProps = {
  itemsParam?: string | null;
};

function parseCheckoutItems(itemsParam: string | null | undefined) {
  if (!itemsParam) {
    return [];
  }

  return itemsParam
    .split(",")
    .map((item) => {
      const [productId, quantity] = item.split(":").map(Number);

      return {
        productId,
        quantity: Math.max(1, quantity || 1),
      };
    })
    .filter(({ productId }) => Number.isFinite(productId));
}

export function CheckoutPageClient({ itemsParam }: CheckoutPageClientProps) {
  const products = useMemo(() => GetProductItems(), []);
  const initialCheckoutCart = useMemo(
    () => parseCheckoutItems(itemsParam),
    [itemsParam],
  );
  const {
    value: checkoutCart,
    setValue: setCheckoutCart,
    isHydrated,
  } = usePersistentCollection<CartEntry[]>({
    storageKey: "boltshift:cart",
    fallback: initialCheckoutCart.length > 0 ? initialCheckoutCart : [],
    hydrateFromStorage: !itemsParam,
  });
  const [orderCompleteOpen, setOrderCompleteOpen] = useState(false);

  const dispatchCheckoutCart = (
    action: Parameters<typeof cartReducer>[1],
  ) => {
    setCheckoutCart((currentCart) => cartReducer(currentCart, action));
  };

  const checkoutItems = useMemo(
    () => getCartItems(checkoutCart, products),
    [checkoutCart, products],
  );

  return (
    <div className="w-full">
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
          <BackButton content="Shopping Cart" href="/cart" />
        </div>
        <SectionTitle
          title="Checkout"
          icon="/section-title-icons/Delivery-truck.svg"
          alt="Delivery Truck icon"
          className="py-4"
        />

        <div className="flex w-full flex-col gap-10 pb-12 lg:flex-row lg:items-start">
          {/* Shipping details */}
          <div className="flex min-w-0 flex-1 flex-col gap-12">
            <PersonalDetailsCard />
            <DashedSeparator />
            <ShippingDetailsCard />
            <DashedSeparator />
            <ShippingMethodCard />
            <DashedSeparator />
            <PaymentMethodCard />
          </div>
          <div className="flex w-full justify-center lg:w-auto lg:shrink-0">
            {!isHydrated ? (
              <CheckoutSummarySkeleton />
            ) : (
              <OrderSummary
                items={checkoutItems}
                onOrderNow={() => {
                  dispatchCheckoutCart({ type: "clear" });
                  void clearCart().catch(() => {});
                  setOrderCompleteOpen(true);
                }}
              >
                {checkoutItems.length > 0 ? (
                  <div className="flex flex-col">
                    {checkoutItems.map(({ product, quantity }) => (
                      <CheckoutProductCard
                        key={product.id}
                        product={product}
                        quantity={quantity}
                        onRemove={() =>
                          (() => {
                            dispatchCheckoutCart({
                              type: "remove",
                              productId: product.id,
                            });
                            void removeCartProduct(product.id).catch(() => {});
                          })()
                        }
                        onDecrement={() =>
                          (() => {
                            dispatchCheckoutCart({
                              type: "decrement",
                              productId: product.id,
                            });
                            void updateCartProduct(
                              product.id,
                              Math.max(1, quantity - 1),
                            ).catch(() => {});
                          })()
                        }
                        onIncrement={() =>
                          (() => {
                            dispatchCheckoutCart({
                              type: "increment",
                              productId: product.id,
                            });
                            void addCartProduct(product.id).catch(() => {});
                          })()
                        }
                      />
                    ))}
                  </div>
                ) : null}
              </OrderSummary>
            )}
          </div>
        </div>
      </main>

      <OrderCompletionModal open={orderCompleteOpen} />
      <Footer />
    </div>
  );
}
