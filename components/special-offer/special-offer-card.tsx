"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { showSonnerMessage } from "@/components/alert/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ColorSwatchSelector } from "@/components/ui/color-swatch-selector";
import { LabelSelector } from "@/components/ui/label-selector";
import { addProductToStoredCart } from "@/lib/wishlist/wishlist";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { StartRating } from "@/components/rating/rating";
import { cn, EditNum } from "@/lib/utils";
import type { Product } from "@/types/type";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { useStoredCartItem } from "@/hooks/use-stored-cart-item";

type SpecialOfferCardProps = {
  product: Product;
};

export function SpecialOfferCard({ product }: SpecialOfferCardProps) {
  const selectedItem = product;
  const isInCart = useStoredCartItem(selectedItem.id);

  const [selectedColor, setSelectedColor] = useState(
    selectedItem.variants[0]?.color ?? "",
  );
  const [selectedSize, setSelectedSize] = useState(
    selectedItem.variants[0]?.sizes[0] ?? "",
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant =
    selectedItem.variants.find((v) => v.color === selectedColor) ||
    selectedItem.variants[0];

  const colors = selectedItem.variants.map((v) => v.color);
  const isStorage = selectedVariant?.sizes.some(
    (s) => s.toLowerCase().includes("gb") || s.toLowerCase().includes("tb"),
  );

  const price = selectedItem.price;
  const totalPrice = EditNum(price * quantity);
  const discountPercent = selectedItem.discountPercent ?? 0;
  const badges = [
    discountPercent > 0 ? `${discountPercent}% Discount` : null,
    selectedItem.newArrival ? "New Arrival" : null,
    selectedItem.trending ? "Trending" : null,
  ].filter((badge): badge is string => badge !== null);
  const selectedImage = selectedItem.images[selectedImageIndex] ?? selectedItem.images[0];

  useEffect(() => {
    const firstVariant = selectedItem.variants[0];
    if (!firstVariant) {
      return;
    }

    setSelectedColor(firstVariant.color);
    setSelectedSize(firstVariant.sizes[0] ?? "");
    setSelectedImageIndex(0);
    setQuantity(1);
  }, [selectedItem.id]);

  useEffect(() => {
    if (!selectedVariant?.sizes.includes(selectedSize)) {
      setSelectedSize(selectedVariant?.sizes[0] ?? "");
    }
  }, [selectedColor, selectedVariant, selectedSize]);

  const checkoutHref = `/checkout?items=${encodeURIComponent(`${selectedItem.id}:${quantity}`)}`;

  const Increment = () => {
    setQuantity((prev) => prev + 1);
  };

  const Decrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    if (isInCart) {
      return;
    }

    addProductToStoredCart(selectedItem.id, quantity);
    showSonnerMessage({
      variant: "success",
      title: "Item Added to Cart",
      description: "Checkout the cart and proceed to complete your order.",
      iconSrc: "/sonnar/Green-Featured-outline.svg",
    });
  };

  return (
    <Card className="w-full p-0 border-none shadow-none">
      <div className="w-full flex flex-col gap-4 min-[1160px]:flex-row min-[1160px]:gap-12">
        {/* Mobile screen display */}
        <div className="grid gap-4 min-[1160px]:hidden">
          <div className="flex gap-2 flex-wrap">
            {badges.map((badge) => (
              <Badge key={badge} variant="outline" className="text-primary border-primary/25">
                {badge}
              </Badge>
            ))}
          </div>

          <div className="grid gap-4">
            <div className="grid gap-1">
              <CardTitle className="text-2xl font-semibold p-0 line-clamp-3">
                {selectedItem.name}
              </CardTitle>

              <div className="flex gap-2">
                <StartRating value={selectedItem.ratings} />

                <p className="text-sm font-normal text-muted-foreground">
                  ({selectedItem.reviews} reviews)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Left Images */}
        <div className="w-full h-full flex flex-col gap-4 md:flex-row md:items-stretch">
          <div className="w-full h-full flex-1 rounded-xl overflow-hidden border relative">
            <AspectRatio ratio={1 / 1} className="relative">
              <Image
                src={selectedImage}
                alt={selectedItem.name}
                fill
                sizes="(min-width: 768px) 50vw, calc(100vw - 2rem)"
                loading="eager"
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          </div>

          <div className="p-1 flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide md:max-h-157.5 md:flex-col md:overflow-y-auto lg:max-h-221.5 xl:max-h-143.5">
            {selectedItem.images.map((image, index) => (
              <div
                key={`${selectedItem.id}-image-${index}`}
                onClick={() => setSelectedImageIndex(index)}
                className={cn(
                  "h-20 w-20 min-w-20 aspect-square rounded-xl relative cursor-pointer transition",
                  selectedImageIndex === index
                    ? "ring-2 ring-offset-2 ring-ring"
                    : "",
                )}
              >
                <AspectRatio ratio={1 / 1} className="relative">
                  <Image
                    src={image}
                    alt={`${selectedItem.name} image ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover rounded-xl"
                  />
                </AspectRatio>
              </div>
            ))}
          </div>
        </div>

        {/* Content Right */}
        <div className="w-full">
          <div className="max-w-93 grid gap-3 overflow-hidden">
            <CardHeader className="w-full min-w-0 px-0 gap-3">
              {/* Hide on mobile, show on min-[1160px] */}
              <div className="hidden min-[1160px]:flex gap-2">
                {badges.map((badge) => (
                  <Badge key={badge} variant="outline" className="text-primary border-primary/25">
                    {badge}
                  </Badge>
                ))}
              </div>
              <div className="grid gap-2">
                {/* Hide on mobile, show on min-[1160px] */}
                <div className="hidden min-[1160px]:block">
                  <CardTitle className="text-2xl font-semibold p-0 line-clamp-3">
                    {selectedItem.name}
                  </CardTitle>
                </div>
                {/* Hide on mobile, show on min-[1160px] */}
                <div className="hidden min-[1160px]:flex gap-2">
                  <StartRating value={selectedItem.ratings} />
                  <p className="text-sm font-normal text-muted-foreground">
                    ({selectedItem.reviews} reviews)
                  </p>
                </div>
                <CardDescription className="text-sm line-clamp-3">
                  {selectedItem.excerpt ?? selectedItem.description}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="min-w-0 px-0 grid gap-3">
              <p className="text-sm font-semibold">
                SKU:{selectedItem.sku ?? ""}
              </p>

              {/* Color selector */}
              <div className="grid gap-2">
                <p className="text-lg font-medium flex items-center gap-0.5">
                  <span>Color</span>
                  <span>:</span>
                  <span className="font-mono">{selectedColor}</span>
                </p>
                <ColorSelector
                  value={selectedColor}
                  onChange={setSelectedColor}
                  options={colors}
                />
              </div>

              {/* Storage */}
              <div className="grid gap-2">
                <p className="text-lg font-medium flex items-center gap-0.5">
                  <span>{isStorage ? "Storage" : "Size"}</span>
                  <span>:</span>
                  <span>{selectedSize}</span>
                </p>
                <StorageSize
                  value={selectedSize}
                  onChange={setSelectedSize}
                  options={selectedVariant?.sizes || []}
                />
              </div>

              <p className="text-xl flex gap-1">
                Ksh.<span className="font-semibold">{totalPrice}</span>
              </p>
            </CardContent>

            <CardFooter className="w-full px-0 grid grid-cols-2 gap-4 sm:max-w-96 min-w-0">
              <ButtonGroup
                aria-label="Media controls"
                className="w-full min-w-0 flex justify-evenly"
              >
                <Button
                  onClick={Decrement}
                  variant="outline"
                  size="icon-lg"
                  className="flex-1 border-r-0"
                >
                  <Minus />
                </Button>

                <div className="flex items-center justify-center text-sm font-medium border-y">
                  {quantity}
                </div>

                <Button
                  onClick={Increment}
                  variant="outline"
                  size="icon-lg"
                  className="flex-1"
                >
                  <Plus />
                </Button>
              </ButtonGroup>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleAddToCart}
                aria-label={
                  isInCart
                    ? `${selectedItem.name} is already in cart`
                    : `Add ${selectedItem.name} to cart`
                }
                disabled={isInCart}
              >
                <ShoppingCart className="text-muted-foreground" />
                {isInCart ? "In Cart" : "Add to Cart"}
              </Button>

              <Button asChild className="w-full col-span-2" size="lg">
                <Link href={checkoutHref}>Buy Now</Link>
              </Button>
            </CardFooter>
          </div>
        </div>
      </div>
    </Card>
  );
}

type SelectorProps = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
};

function ColorSelector({ value, onChange, options }: SelectorProps) {
  return (
    <ColorSwatchSelector.Root
      value={value}
      onValueChange={onChange}
      className="bg-background p-0"
    >
      <ColorSwatchSelector.Content>
        {options.map((color) => (
          <ColorSwatchSelector.Item key={color} value={color} />
        ))}
      </ColorSwatchSelector.Content>
    </ColorSwatchSelector.Root>
  );
}

function StorageSize({ value, onChange, options }: SelectorProps) {
  return (
    <LabelSelector.Root
      value={value}
      onValueChange={onChange}
      className="bg-background p-0 w-93"
    >
      <LabelSelector.Content className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <LabelSelector.Item key={opt} value={opt} size="sm" rounded="full" />
        ))}
      </LabelSelector.Content>
    </LabelSelector.Root>
  );
}
