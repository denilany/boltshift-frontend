"use client";

import { type ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { VoucherDropdownMenu } from "@/components/cart-quantity/voucher-dropdown-card";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashedSeparator } from "@/components/separator/dashed-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Label } from "@/components/ui/label";
import { vouchers } from "@/lib/voucher";
import { Product } from "@/types/type";

const TAX_RATE = 0.14;
const SHIPPING_FEE = 500;

type OrderSummaryItem = {
  product: Product;
  quantity: number;
};

type OrderSummaryProps = {
  items?: OrderSummaryItem[];
  children?: ReactNode;
  onOrderNow?: () => void;
  onCouponCodeChange?: (couponCode: string) => void;
  isOrderNowLoading?: boolean;
};

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  maximumFractionDigits: 0,
});

function formatCurrency(amount: number) {
  return currencyFormatter.format(Math.max(0, Math.round(amount)));
}

function formatPercentage(rate: number) {
  return `${Math.round(rate)}%`;
}

function getCheckoutHref(items: OrderSummaryItem[]) {
  // Preserve the cart quantities in the checkout URL so refreshes keep context.
  const checkoutItems = items
    .map(({ product, quantity }) => `${product.id}:${quantity}`)
    .join(",");

  return checkoutItems
    ? `/checkout?items=${encodeURIComponent(checkoutItems)}`
    : "/checkout";
}

function getVoucherDiscountRate(title: string) {
  // Voucher copy currently carries percentage values, for example "10% off".
  const discountMatch = title.match(/(\d+)%/);

  return discountMatch ? Number(discountMatch[1]) / 100 : 0;
}

function getVoucherDiscount(
  voucher: (typeof vouchers)[number] | undefined,
  subtotal: number,
  shipping: number,
) {
  if (!voucher) {
    return {
      productDiscount: 0,
      shippingDiscount: 0,
      label: "0%",
    };
  }

  if (voucher.title.toLowerCase().includes("free shipping")) {
    // Free-shipping vouchers only remove delivery cost, not product subtotal.
    return {
      productDiscount: 0,
      shippingDiscount: shipping,
      label: "Free shipping",
    };
  }

  const voucherRate = getVoucherDiscountRate(voucher.title);

  return {
    productDiscount: subtotal * voucherRate,
    shippingDiscount: 0,
    label: formatPercentage(voucherRate * 100),
  };
}

export function OrderSummary({
  items = [],
  children,
  onOrderNow,
  onCouponCodeChange,
  isOrderNowLoading = false,
}: OrderSummaryProps) {
  const pathname = usePathname();
  const [voucherCode, setVoucherCode] = useState("");
  const [selectedVoucherId, setSelectedVoucherId] = useState("");
  const isCheckoutPage = pathname === "/checkout";
  const checkoutButtonLabel =
    isCheckoutPage ? "Order Now" : "Check Out";
  const selectedVoucher = vouchers.find(
    (voucher) => voucher.id === selectedVoucherId,
  );
  const orderTotals = useMemo(() => {
    // Recalculate totals only when cart items or the selected voucher changes.
    const subtotal = items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
    const shipping = subtotal > 0 ? SHIPPING_FEE : 0;
    const voucherDiscount = getVoucherDiscount(
      selectedVoucher,
      subtotal,
      shipping,
    );
    const discountedSubtotal = Math.max(
      0,
      subtotal - voucherDiscount.productDiscount,
    );
    const discountedShipping = Math.max(
      0,
      shipping - voucherDiscount.shippingDiscount,
    );
    const tax = discountedSubtotal * TAX_RATE;
    const total = discountedSubtotal + discountedShipping + tax;

    return {
      subtotal,
      shipping,
      tax,
      taxRate: TAX_RATE * 100,
      voucherDiscount:
        voucherDiscount.productDiscount + voucherDiscount.shippingDiscount,
      voucherDiscountLabel: voucherDiscount.label,
      total,
    };
  }, [items, selectedVoucher]);

  return (
    <Card className="w-full max-w-none p-6 border rounded-xl flex flex-col gap-8 md:max-w-84">
      <CardHeader className="py-2 px-0">
        <CardTitle className="flex items-center gap-1 text-2xl font-semibold">
          <img
            src="/section-title-icons/Clipboard.svg"
            alt="Clipboard icon"
            className="h-8 w-8"
          />
          Order Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="w-full p-0 flex flex-col gap-4 md:w-72">
        {children}
        {children ? <DashedSeparator /> : null}

        <div className="w-full py-1 flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>
            Kshs.{" "}
            <span className="font-semibold text-sm text-foreground">
              {formatCurrency(orderTotals.subtotal)}
            </span>
          </span>
        </div>

        <div className="w-full py-1 flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span>
            Kshs.{" "}
            <span className="font-semibold text-sm text-foreground">
              {formatCurrency(orderTotals.shipping)}
            </span>
          </span>
        </div>

        <div className="w-full py-1 flex justify-between text-muted-foreground">
          <span>Tax</span>
          <span>
            Kshs.{" "}
            <span className="font-semibold text-sm text-foreground">
              {formatCurrency(orderTotals.tax)} (
              {formatPercentage(orderTotals.taxRate)})
            </span>
          </span>
        </div>

        {/* Voucher */}
        <div className="space-y-2">
          <Label htmlFor="voucher-code" className="text-muted-foreground">
            Voucher Code
          </Label>
          <ButtonGroup className="h-11 w-full overflow-hidden rounded-lg border hover:ring-1 hover:ring-ring hover:ring-offset-2">
            <Input
              id="voucher-code"
              placeholder="Add a voucher"
              value={voucherCode}
              onChange={(event) => {
                const code = event.target.value;

                setVoucherCode(code);
                onCouponCodeChange?.(code.trim());
                setSelectedVoucherId(
                  vouchers.find(
                    (voucher) =>
                      voucher.code.toLowerCase() === code.trim().toLowerCase(),
                  )?.id ?? "",
                );
              }}
              className="h-full rounded-lg"
            />

            <VoucherDropdownMenu
              selectedVoucherId={selectedVoucherId}
              onSelectVoucher={(voucher) => {
                setSelectedVoucherId(voucher.id);
                setVoucherCode(voucher.code);
                onCouponCodeChange?.(voucher.code);
              }}
            />
          </ButtonGroup>
        </div>

        {/* Discount */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Discount</span>
          <span>
            Kshs.{" "}
            <span className="font-semibold text-sm text-foreground">
              {formatCurrency(orderTotals.voucherDiscount)} (
              {orderTotals.voucherDiscountLabel})
            </span>
          </span>
        </div>
      </CardContent>

      <DashedSeparator />

      <CardFooter className="w-full p-0 flex flex-col gap-8">
        {/* Total */}
        <div className="w-full py-1 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>Kshs. {formatCurrency(orderTotals.total)}</span>
        </div>

        {/* Checkout becomes an action button on /checkout so order completion can open a modal. */}
        {items.length === 0 ? (
          <Button size="lg" className="w-full" disabled>
            {checkoutButtonLabel}
            <ArrowRight size="5" />
          </Button>
        ) : isCheckoutPage ? (
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={isOrderNowLoading}
            onClick={onOrderNow}
          >
            {isOrderNowLoading ? "Processing..." : checkoutButtonLabel}
            <ArrowRight size="5" />
          </Button>
        ) : (
          <Button size="lg" className="w-full" asChild>
            <Link
              href={getCheckoutHref(items)}
              transitionTypes={["cross-fade"]}
            >
              {checkoutButtonLabel}
              <ArrowRight size="5" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
