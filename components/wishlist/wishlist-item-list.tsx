import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { DeleteModal } from "@/components/delete-item/delete-modal";
import { ProductItemSummary } from "@/components/product-item-summary/product-item-summary";
import { Product } from "@/types/type";
import { EditNum } from "@/lib/utils";
import {
  showSonnerMessage,
  type SonnerMessageProps,
} from "@/components/alert/alert";

type WishlistItemProps = {
  product: Product;
  quantity: number;
  onRemove: () => void;
  onDecrement: () => void;
  onIncrement: () => void;
  onAddToCart: (quantity: number) => void;
  label?: string;
  colorName?: string;
};

export function WishlistItem({
  product,
  quantity,
  onRemove,
  onDecrement,
  onIncrement,
  onAddToCart,
  label,
  colorName,
}: WishlistItemProps) {
  const [displayQuantity, setDisplayQuantity] = useState(quantity);
  const itemLabel = label ?? product.variants[0]?.sizes[0] ?? "Default";
  const itemColorName = colorName ?? product.variants[0]?.color ?? "Default";

  const title = "Remove Item from Wishlist";
  const description =
    "Are you sure you want to delete this item from wishlist? This action cannot be undone.";
  const actionLabel = "Remove Item";

  // Sonnar message
  const notification: SonnerMessageProps = {
    variant: "success",
    title: "Item Added to Cart",
    description: "Checkout the cart and proceed to complete your order.",
    iconSrc: "/sonnar/Green-Featured-outline.svg",
  };

  const handleConfirm = () => {
    onAddToCart(displayQuantity);

    if (notification) {
      showSonnerMessage(notification);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4 border-b py-4 md:flex-row md:justify-between">
      <ProductItemSummary
        product={product}
        label={itemLabel}
        colorName={itemColorName}
      />

      {/* Items price and quantity */}
      <div className="flex w-full items-center justify-between md:gap-4 md:max-w-93.75 md:justify-start">
        <DeleteModal
          title={title}
          description={description}
          actionLabel={actionLabel}
          onConfirm={onRemove}
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove item"
              className="justify-self-start text-muted-foreground hover:text-destructive md:justify-self-center"
            >
              <Trash2 className="size-4" />
            </Button>
          }
        />

        <div className="flex items-center gap-1 text-sm md:justify-self-start">
          <span className="text-muted-foreground">Kshs.</span>
          <span className="font-medium">
            {EditNum(product.price * quantity)}
          </span>
        </div>

        <ButtonGroup
          aria-label="Quantity controls"
          className="h-10 w-32 overflow-hidden rounded-lg border bg-background md:justify-self-start"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Decrease quantity"
            onClick={() => {
              if (displayQuantity <= 1) {
                return;
              }

              setDisplayQuantity((currentQuantity) => currentQuantity - 1);
              onDecrement();
            }}
            disabled={displayQuantity <= 1}
            className="h-full flex-1 rounded-none text-muted-foreground"
          >
            <Minus className="size-4" />
          </Button>

          <ButtonGroupText className="h-full min-w-8 flex-1 justify-center rounded-none border-0 bg-transparent px-0 text-sm font-semibold shadow-none">
            {displayQuantity}
          </ButtonGroupText>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Increase quantity"
            onClick={() => {
              setDisplayQuantity((currentQuantity) => currentQuantity + 1);
              onIncrement();
            }}
            className="h-full flex-1 rounded-none text-muted-foreground"
          >
            <Plus className="size-4" />
          </Button>
        </ButtonGroup>

        <Button
          type="button"
          size="icon"
          aria-label={`Add ${product.name} to cart`}
          onClick={handleConfirm}
          className="rounded-md hover:cursor-pointer"
        >
          <ShoppingCart className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
