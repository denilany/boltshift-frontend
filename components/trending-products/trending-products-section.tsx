import { SectionTitle } from "@/components/section-title";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingProductsCard } from "@/components/trending-products/trending-products-card";
import {
  fetchTrendingProducts,
  type TrendingProductCardProduct,
} from "@/lib/products/trending-products";

const title = "Trending Products";
const icon = "/section-title-icons/Chart_increasing.svg";
const alt = "Raising chart icon";
const titleId = "trending-products-title";

function TrendingProductsSectionFallback() {
  return (
    <div className="py-12 flex flex-col gap-10">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-56" />
      </div>

      <div className="w-full p-1 flex gap-4 overflow-x-auto scrollbar-hide">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="w-72 shrink-0 rounded-2xl border p-3">
            <Skeleton className="h-72 w-full rounded-xl" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendingProductsEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-8">
      <p className="text-sm font-semibold">No trending products right now.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        We couldn&apos;t find any products marked as trending.
      </p>
    </div>
  );
}

function TrendingProductsErrorState() {
  return (
    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-8">
      <p className="text-sm font-semibold text-destructive">
        We couldn&apos;t load trending products.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Please try again in a moment.
      </p>
    </div>
  );
}

export async function TrendingProductsSection() {
  let products: TrendingProductCardProduct[] = [];
  let hasError = false;

  try {
    products = await fetchTrendingProducts();
  } catch {
    hasError = true;
    products = [];
  }

  return (
    <section className="py-12 flex flex-col gap-10" aria-labelledby={titleId}>
      <SectionTitle id={titleId} title={title} icon={icon} alt={alt} />

      {hasError ? (
        <TrendingProductsErrorState />
      ) : products.length > 0 ? (
        <TrendingProductsCard products={products} />
      ) : (
        <TrendingProductsEmptyState />
      )}
    </section>
  );
}

export function TrendingProductsSectionLoading() {
  return <TrendingProductsSectionFallback />;
}
