import { ProductCard } from "@/components/product-card/product-card";
import type { Product } from "@/types/type";
import { fetchPopularProducts } from "@/lib/products/popular-products";

export async function PopularCardContent({
    products: productsProp,
}: { products?: Product[] } = {}) {
    const products = productsProp ?? await fetchPopularProducts();

    return (
        <div className="w-full grid grid-flow-col grid-rows-2 gap-4 p-1 overflow-x-auto scroll-smooth scrollbar-hide">
            {products.map((p) => (
                <ProductCard key={p.id} variant="horizontal" product={p} />
            ))}
        </div>
    )
}
