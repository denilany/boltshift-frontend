import { SectionTitle } from "@/components/section-title";
import { CatalogCard } from "@/components/catalog/catalog";
import { FilterSidebar } from "@/components/catalog/filters";
import { BreadcrumbComponent } from "@/components/breadcrumb/breadcrumb";
import {
  filterCatalogProducts,
  formatCategoryName,
  type CatalogFilterParams,
} from "@/lib/catalog";
import { SearchResultsHeader } from "@/components/catalog/search-results-header";
import { fetchAllProducts } from "@/lib/products/all-products";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<CatalogFilterParams>;
}) {
  const { category } = await params;
  const filters = await searchParams;
  const query = filters.q?.trim() ?? "";

  const title = formatCategoryName(category);
  const icon = "/popular-categories-icons/Shopping-bags.svg";
  const alt = "Shopping bags icon";

  const items = [
    { label: "Catalog", href: "/catalog" },
    { label: formatCategoryName(category) },
  ];

  const products = await fetchAllProducts();

  // Filter by category first, then by search query within that category
  const categoryProducts = products.filter(
    (p) => p.category === category,
  );
  const filteredCount = filterCatalogProducts(categoryProducts, filters).length;

  return (
    <>
      <BreadcrumbComponent items={items} />

      {/* Title */}
      <div className="py-4 flex flex-col gap-8 sm:flex-row">
        <SectionTitle
          title={title}
          icon={icon}
          alt={alt}
          className="basis-1/4 hidden sm:flex"
        />
        <SearchResultsHeader count={filteredCount} query={query} />
      </div>

      <div className="flex items-start">
        {/* shared sidebar */}
        <FilterSidebar />
        <CatalogCard filters={filters} products={categoryProducts} />
      </div>
    </>
  );
}
