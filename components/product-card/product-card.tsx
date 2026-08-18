"use client";

import { ViewTransition, useDeferredValue, useEffect, useId, useRef, useState } from "react";
import type { ComponentProps, MouseEvent } from "react";
import Image from "next/image";
import { showSonnerMessage } from "@/components/alert/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Product, ProductVariant } from "@/types/type";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import NumberTickerDemo from "@/components/shadcn-space/radix/number-ticker/number-ticker-03";
import { EditNum, GetRatio, cn, FormatNumber } from "@/lib/utils";
import { StartRating } from "@/components/rating/rating";
import Link from "next/link";
import {
  addProductToStoredCart,
  isProductInStoredWishlist,
  toggleProductInStoredWishlist,
} from "@/lib/wishlist";
import { useStoredCartItem } from "@/hooks/use-stored-cart-item";

type ProductCardProps = {
  variant?: ProductVariant;
  product: Product;
  href?: string;
  className?: string;
};

function AddToCartButton({
  product,
  className,
  variant,
}: {
  product: Product;
  className?: string;
  variant?: ComponentProps<typeof Button>["variant"];
}) {
  const isInCart = useStoredCartItem(product.id);

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isInCart) {
      return;
    }

    addProductToStoredCart(product.id);
    showSonnerMessage({
      variant: "success",
      title: "Item Added to Cart",
      description: "Checkout the cart and proceed to complete your order.",
      iconSrc: "/sonnar/Green-Featured-outline.svg",
    });
  };

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleAddToCart}
      disabled={isInCart}
      aria-label={
        isInCart
          ? `${product.name} is already in cart`
          : `Add ${product.name} to cart`
      }
      className={className}
    >
      {isInCart ? "In Cart" : "Add to Cart"}
    </Button>
  );
}

// Shared image block for all card variants, with an optional save button position.
function CardImage({
  product,
  ratio,
  savePosition,
  sizes = "(min-width: 768px) 288px, 50vw",
}: {
  product: Product;
  ratio: number;
  savePosition?: string;
  sizes?: string;
}) {
  const [saved, setSaved] = useState(false);
  const deferredSaved = useDeferredValue(saved);
  const transitionId = useId();
  const lastSaveClickRef = useRef(0);
  const productImage = product.images[0];

  useEffect(() => {
    setSaved(isProductInStoredWishlist(product.id));
  }, [product.id]);

  const handleSaveClick = (event: MouseEvent<HTMLButtonElement>) => {
    // The save button lives inside the product link, so keep this click local.
    event.preventDefault();
    event.stopPropagation();

    const now = Date.now();

    // Throttle rapid taps/clicks to avoid repeated storage writes.
    if (now - lastSaveClickRef.current < 800) {
      return;
    }

    lastSaveClickRef.current = now;
    setSaved(toggleProductInStoredWishlist(product.id));
  };

  return (
    <div className="relative">
      <AspectRatio ratio={ratio} className="relative">
        <Image
          src={productImage}
          alt={product.name}
          fill
          sizes={sizes}
          className="object-cover w-full h-full overflow-hidden"
        />
      </AspectRatio>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={handleSaveClick}
        className={cn(
          "bg-background/50 border-0 h-8 w-8 absolute top-2 right-2 rounded-full hover:cursor-pointer hover:bg-background/50 hover:text-primary",
          savePosition,
          deferredSaved ? "text-primary" : "",
        )}
        aria-label={`${deferredSaved ? "Remove" : "Save"} ${product.name} ${
          deferredSaved ? "from" : "to"
        } wishlist`}
        aria-pressed={deferredSaved}
      >
        <ViewTransition
          name={`wishlist-heart-${product.id}-${transitionId}`}
          share="auto"
          enter="auto"
          default="none"
        >
          <Heart
            aria-hidden="true"
            className={deferredSaved ? "fill-current" : ""}
          />
        </ViewTransition>
      </Button>
    </div>
  );
}

// Default layout used in the hot deals grid.
function DefaultContent({
  product,
  price,
}: {
  product: Product;
  price: string;
}) {
  return (
    <>
      <div>
        <p className="text-xs font-medium truncate">{product.name}</p>
        <p className="text-primary">
          <span className="text-xs">Kshs.</span>
          <span className="text-xs font-medium">{price}</span>
        </p>
      </div>

      <div className="w-full flex items-center gap-1">
        <Progress value={product.progress} className="flex-1 h-1" />

        <div className="flex items-center gap-1 shrink-0">
          <img
            src="/section-title-icons/1F525_Fire_v13_Still 1.svg"
            alt="flamming icon"
            className="w-4 h-4"
            aria-hidden="true"
          />
          <p className="text-xs">{product.itemsLeft} Left</p>
        </div>
      </div>

      <AddToCartButton
        product={product}
        variant="outline"
        className="py-2 px-3 grid gap-1 rounded-md text-sm font-regular hover:cursor-pointer"
      />
    </>
  );
}

// Horizontal layout for compact list-style cards.
function HorizontalDefaultContent({
  product,
  price,
}: {
  product: Product;
  price: string;
}) {
  return (
    <>
      <div className="flex flex-col gap-1 flex-1">
        <p className="text-xs font-medium line-clamp-2">{product.name}</p>

        <p className="text-primary">
          <span className="text-xs">Kshs.</span>
          <span className="text-xs font-medium">{price}</span>
        </p>
      </div>

      <AddToCartButton
        product={product}
        variant="outline"
        className="w-full py-2 px-3 rounded-md text-sm font-semibold hover:cursor-pointer"
      />
    </>
  );
}

type HorizontalProfileProps = {
  product: Pick<Product, "images" | "name">;
  label?: string;
  colorName?: string;
  colorValue?: string;
  className?: string;
  imageSizes?: string;
};

// Cards used in the wishlist and cart pages
export function HorizontalProfile({
  product,
  label = "",
  colorName = "",
  colorValue = "",
  className,
  imageSizes = "96px",
}: HorizontalProfileProps) {
  const productImage = product.images[0];

  return (
    <Card
      className={cn(
        "w-full max-w-140 border p-0 shadow-none",
        className,
      )}
    >
      <CardContent className="flex items-center gap-3">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-secondary">
          <Image
            src={productImage}
            alt={product.name}
            fill
            sizes={imageSizes}
            className="object-cover"
          />
        </div>

        {/* Right content */}
        <div className="grid flex-1 gap-2">
          <p className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">
            {product.name}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-md px-2 py-0.75 text-xs font-medium text-muted-foreground"
            >
              {label}
            </Badge>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span
                aria-hidden="true"
                className="size-5 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: colorValue }}
              />
              <span className="truncate">{colorName}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Promo card layout with a live countdown/ticker element.
function CountdownContent({
  product,
  price,
}: {
  product: Product;
  price: string;
}) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-normal truncate">{product.name}</p>
        <p className="text-primary">
          <span className="text-xl">Kshs.</span>
          <span className="text-xl font-semibold">{price}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <NumberTickerDemo />
        <AddToCartButton
          product={product}
          className="w-full py-2 px-3 grid gap-1 rounded-md text-sm font-regular hover:cursor-pointer"
        />
      </div>
    </>
  );
}

// Center-aligned layout for spotlight/featured cards.
function CenteredContent({
  product,
  price,
}: {
  product: Product;
  price: string;
}) {
  const categoryLabel = product.category.replace(/-/g, " ");

  return (
    <>
      <div className="grid gap-1">
        <p className="text-sm font-normal line-clamp-2 min-h-10">
          {product.name}
        </p>
        <p className="text-primary">
          <span className="text-xl">Kshs.</span>
          <span className="text-xl font-semibold">{price}</span>
        </p>
      </div>

      <AddToCartButton
        product={product}
        variant="outline"
        className="py-2 px-3 grid gap-1 rounded-md text-sm font-regular hover:cursor-pointer"
      />
    </>
  );
}

// Catalog-specific content: price + rating summary + formatted review count.
function CatalogContent({
  product,
  price,
  ratings,
}: {
  product: Product;
  price: string;
  ratings: number;
}) {
  const reviews = FormatNumber(product.reviews);

  return (
    <>
      <div>
        <p className="text-xs font-medium line-clamp-2 min-h-8">
          {product.name}
        </p>
        <p className="text-primary">
          <span className="text-xs">Kshs.</span>
          <span className="text-xs font-medium">{price}</span>
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <StartRating value={ratings} readonly />
        <p className="text-xs text-muted-foreground">({reviews} reviews)</p>
      </div>
    </>
  );
}

// OVERALL CARD COMPONENT WITH THE IMAGE AND CONTENT COMBINED
export function ProductCard({
  variant = "default",
  product,
  href,
  className,
}: ProductCardProps) {
  // Format display-only values once so child sections stay presentation-focused.
  const price = EditNum(product.price);
  const ratio = GetRatio(variant);
  const productHref =
    href ?? `/catalog/${product.category}/${product.subcategory}/${product.slug ?? product.id}`;

  return (
    <Link href={productHref}>
      <Card
        className={cn(
          "mx-auto w-full p-0 hover:ring-2 hover:ring-ring hover:ring-offset-2 hover:shadow-md hover:cursor-pointer transition-all duration-200 ease-in-out shadow-none",
          className,
        )}
      >
        <CardContent
          className={`
          px-0 pt-0 pb-3 rounded-xl overflow-hidden flex grow
          ${variant === "horizontal" ? "pb-0 items-center" : "flex-col gap-4"}
        `}
        >
          {/* Switch image container sizing only for horizontal cards. */}
          {variant === "horizontal" ? (
            <div className="w-32 shrink-0">
              <CardImage
                product={product}
                ratio={ratio}
                savePosition="left-2"
                sizes="128px"
              />
            </div>
          ) : (
            <CardImage product={product} ratio={ratio} />
          )}

          {/* SWITCH CONTENT DEPENDING ON THE CARD TYPE */}
          <div
            className={cn(
              "px-3 flex flex-col",
              variant === "horizontal" && "px-4 items-center gap-3",
              variant === "default" && "gap-1",
              variant === "centered" && "w-72 text-center gap-5",
              variant === "countdown" && "text-center gap-10",
              variant === "catalog" && "text-left gap-2",
            )}
          >
            {/* Render content block based on variant to avoid duplicating card shell markup. */}
            {variant === "countdown" ? (
              <CountdownContent product={product} price={price} />
            ) : variant === "horizontal" ? (
              <HorizontalDefaultContent product={product} price={price} />
            ) : variant === "centered" ? (
              <CenteredContent product={product} price={price} />
            ) : variant === "catalog" ? (
              <CatalogContent
                product={product}
                price={price}
                ratings={product.ratings}
              />
            ) : (
              <DefaultContent product={product} price={price} />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
