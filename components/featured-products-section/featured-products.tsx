import { ProductCard } from "@/components/product-card/product-card";
import { fetchFeaturedProducts } from "@/lib/products/featured-products";
import { SectionTitle } from "@/components/section-title";

export async function FeaturedProducts() {
  const products = await fetchFeaturedProducts();
  const icon = "/section-title-icons/Clipboard.svg";
  const title = "Featured Products";
  const alt = "Clipboard image icon";

  return (
    <div className="w-full py-12 flex flex-col gap-10">
      <SectionTitle
        alt={alt}
        icon={icon}
        title={title}
        className="justify-start"
      />

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="basis-1/2 grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2">
          {products.slice(0, 2).map((p) => (
            <ProductCard
              key={p.id}
              variant="countdown"
              product={p}
              className=""
            />
          ))}
        </div>

        <div className="basis-1/2 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {products.slice(2, 6).map((p) => (
              <ProductCard key={p.id} variant="default" product={p} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2">
            {products.slice(6, 8).map((p) => (
              <ProductCard key={p.id} variant="wide" product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
