import type { Product } from "@/types/type";

export type CatalogFilterParams = {
  q?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  ratings?: string;
  categories?: string;
  subcategories?: string;
  brands?: string;
  shipping?: string;
  tags?: string;
  inStock?: string;
};

/**
 * Filters a product list by a search query, matching against the
 * product name, category, and subcategory (case-insensitive).
 *
 * Returns the full list unchanged when no query is provided.
 */
export function filterProducts(products: Product[], query?: string): Product[] {
  if (!query?.trim()) return products;

  const q = query.trim().toLowerCase();

  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subcategory?.toLowerCase().includes(q),
  );
}

function parseList(value?: string): string[] {
  return value
    ?.split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean) ?? [];
}

function parsePrice(value?: string): number | null {
  if (!value?.trim()) return null;

  const price = Number(value);
  return Number.isFinite(price) ? price : null;
}

function productMatchesText(product: Product, value: string): boolean {
  const normalized = value.toLowerCase();

  return (
    product.name.toLowerCase().includes(normalized) ||
    product.category.toLowerCase().includes(normalized) ||
    product.subcategory.toLowerCase().includes(normalized)
  );
}

export function filterCatalogProducts(
  products: Product[],
  filters: CatalogFilterParams,
): Product[] {
  const minPrice = parsePrice(filters.minPrice);
  const maxPrice = parsePrice(filters.maxPrice);
  const ratings = parseList(filters.ratings)
    .map(Number)
    .filter((rating) => Number.isFinite(rating));
  const categories = parseList(filters.categories);
  const subcategories = parseList(filters.subcategories);
  const brands = parseList(filters.brands);
  const shipping = parseList(filters.shipping);
  const tags = parseList(filters.tags);

  const filtered = filterProducts(products, filters.q).filter((product) => {
    if (minPrice !== null && product.price < minPrice) return false;
    if (maxPrice !== null && product.price > maxPrice) return false;
    if (ratings.length > 0 && !ratings.includes(product.ratings)) return false;
    if (categories.length > 0 && !categories.includes(product.category)) return false;
    if (
      subcategories.length > 0 &&
      !subcategories.includes(product.subcategory)
    ) {
      return false;
    }
    if (filters.inStock === "true" && product.itemsLeft <= 0) return false;

    if (tags.length > 0 && !tags.some((tag) => productMatchesText(product, tag))) {
      return false;
    }

    /**
     * The current product model has no brand or shipping fields yet. Keep these
     * filters URL-backed and stateful without hiding every product.
     */
    void brands;
    void shipping;

    return true;
  });

  return [...filtered].sort((a, b) => {
    const aId = typeof a.id === "number" ? a.id : Number(a.id) || 0;
    const bId = typeof b.id === "number" ? b.id : Number(b.id) || 0;

    switch (filters.sort?.toLowerCase()) {
      case "oldest":
        return aId - bId;
      case "popular":
        return b.reviews - a.reviews;
      case "latest":
      default:
        return bId - aId;
    }
  });
}

/**
 * Formats a URL slug (e.g. "air-compressors") into a human-readable title ("Air Compressors")
 */
export function formatCategoryName(text: string): string {
  return text.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
