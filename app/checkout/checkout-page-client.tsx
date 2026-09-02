"use client";

import { useEffect, useMemo, useState } from "react";

import { Navbar, NavbarMobile } from "@/components/navigation/navbar";
import { Footer } from "@/components/footer/footer-section";
import { SectionTitle } from "@/components/section-title";
import { BackButton } from "@/components/back/back";
import { CheckoutProductCard } from "@/components/checkout/checkout-product-spec";
import { GetProductItems } from "@/lib/product-items";
import { cartReducer, getCartItems, type CartEntry } from "@/lib/wishlist/wishlist";
import { PersonalDetailsCard } from "@/components/checkout/personal-details";
import { ShippingDetailsCard } from "@/components/checkout/shipping-details";
import type { ShippingDetails } from "@/components/checkout/shipping-details";
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
  fetchCart,
  removeCartProduct,
  type CartItem as ApiCartItem,
  updateCartProduct,
} from "@/lib/cart/cart-api";
import { showSonnerMessage } from "@/components/alert/alert";
import { checkoutOrder } from "@/lib/orders/order-api";
import { WishlistApiError } from "@/lib/wishlist/wishlist-api";

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
      const separatorIndex = item.lastIndexOf(":");
      const productId =
        separatorIndex === -1 ? item : item.slice(0, separatorIndex);
      const quantity =
        separatorIndex === -1 ? 1 : Number(item.slice(separatorIndex + 1));

      return {
        productId,
        quantity: Math.max(1, quantity || 1),
      };
    })
    .filter(({ productId }) => productId.length > 0);
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
  const [apiCheckoutItems, setApiCheckoutItems] = useState<
    ApiCartItem[] | null
  >(null);
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    office: "",
    street: "",
    city: "",
    country: "",
  });

  const dispatchCheckoutCart = (
    action: Parameters<typeof cartReducer>[1],
  ) => {
    setCheckoutCart((currentCart) => cartReducer(currentCart, action));
  };

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    let isActive = true;

    void fetchCart()
      .then((response) => {
        if (!isActive || response.items.length === 0) {
          return;
        }

        const requestedIds = new Set(
          initialCheckoutCart.map(({ productId }) => String(productId)),
        );
        const items = itemsParam
          ? response.items.filter((item) =>
              requestedIds.has(String(item.product.id)),
            )
          : response.items;

        if (items.length > 0) {
          setApiCheckoutItems(items);
          setCheckoutCart(
            items.map(({ product, quantity }) => ({
              productId: product.id,
              quantity,
            })),
          );
        }
      })
      .catch(() => {
        // Keep using the URL or locally stored cart when the API is unavailable.
      });

    return () => {
      isActive = false;
    };
  }, [initialCheckoutCart, isHydrated, itemsParam, setCheckoutCart]);

  const checkoutItems = useMemo(
    () => apiCheckoutItems ?? getCartItems(checkoutCart, products),
    [apiCheckoutItems, checkoutCart, products],
  );

  async function handleOrderNow() {
    if (checkoutItems.length === 0 || isOrderSubmitting) {
      return;
    }

    setIsOrderSubmitting(true);

    try {
      await checkoutOrder({
        items: checkoutItems.map(({ product, quantity }) => ({
          product_id: product.id,
          quantity,
        })),
        address: {
          street: [shippingDetails.office, shippingDetails.street]
            .filter(Boolean)
            .join(", "),
          city: shippingDetails.city,
          state: "",
          zip: "",
          country: shippingDetails.country,
        },
        ...(couponCode ? { coupon_code: couponCode } : {}),
      });

      dispatchCheckoutCart({ type: "clear" });
      void clearCart().catch(() => {});
      setOrderCompleteOpen(true);
    } catch (error) {
      showSonnerMessage({
        variant: "delete",
        title: "Unable to place order",
        description:
          error instanceof WishlistApiError
            ? error.message
            : "Please review your checkout details and try again.",
      });
    } finally {
      setIsOrderSubmitting(false);
    }
  }

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
            <ShippingDetailsCard
              value={shippingDetails}
              onChange={setShippingDetails}
            />
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
                onOrderNow={() => void handleOrderNow()}
                onCouponCodeChange={setCouponCode}
                isOrderNowLoading={isOrderSubmitting}
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
                            setApiCheckoutItems((currentItems) =>
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
                            dispatchCheckoutCart({
                              type: "decrement",
                              productId: product.id,
                            });
                            setApiCheckoutItems((currentItems) =>
                              currentItems === null
                                ? currentItems
                                : currentItems.map((item) =>
                                    item.product.id === product.id
                                      ? {
                                          ...item,
                                          quantity: Math.max(1, quantity - 1),
                                        }
                                      : item,
                                  ),
                            );
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
                            setApiCheckoutItems((currentItems) =>
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
