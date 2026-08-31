import { ProductCard } from "@/components/product-card/product-card";
import type { TrendingProductCardProduct } from "@/lib/products/trending-products";

type TrendingProductsCardProps = {
  products: TrendingProductCardProduct[];
};

export function TrendingProductsCard({ products }: TrendingProductsCardProps) {
  return (
    <div className="w-full p-1 flex gap-4 overflow-x-auto scrollbar-hide">
      {products.map((product) => (
        <ProductCard
          key={product.slug}
          variant="centered"
          product={product}
          href={product.href}
        />
      ))}
    </div>
  );
}
