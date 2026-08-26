import { ProductCard } from "@/components/product-card/product-card";
import { SectionTitle } from "@/components/section-title";
import { fetchHotDealTodayProducts } from "@/lib/products/hot-deals";

export async function HotDealsCollection() {
  const products = await fetchHotDealTodayProducts();
  const icon = "/section-title-icons/1F525_Fire_v13_Still 1.svg";
  const title = "Hot Deal Today";
  const alt = "Flamming icon";

  return (
    <div className="w-full py-12 flex flex-col gap-10">
      <SectionTitle
        alt={alt}
        icon={icon}
        title={title}
        className="justify-start"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} variant="default" product={product} />
        ))}
      </div>
    </div>
  );
}
