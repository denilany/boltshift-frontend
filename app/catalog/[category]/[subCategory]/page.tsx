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

export default async function SubCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; subCategory: string }>;
  searchParams: Promise<CatalogFilterParams>;
}) {
  const { category, subCategory } = await params;
  const filters = await searchParams;
  const query = filters.q?.trim() ?? "";

  const title = formatCategoryName(subCategory);
  const icon = "/popular-categories-icons/Shopping-bags.svg";
  const alt = "Shopping bags icon";

  const items = [
    { label: "Catalog", href: "/catalog" },
    { label: formatCategoryName(category), href: `/catalog/${category}` },
    { label: formatCategoryName(subCategory) },
  ];

  const products = await fetchAllProducts();

  // Filter by category + subcategory first, then by search query within that scope
  const scopedProducts = products.filter(
    (p) => p.category === category && p.subcategory === subCategory,
  );
  const filteredCount = filterCatalogProducts(scopedProducts, filters).length;

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
        <CatalogCard filters={filters} products={scopedProducts} />
      </div>
    </>
  );
}
