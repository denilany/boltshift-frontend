import { HeroCarouselClient } from "./hero-carousel-client";
import { fetchTrendingProducts } from "@/lib/products/trending-products";

export async function HeroCarousel() {
  let products: Awaited<ReturnType<typeof fetchTrendingProducts>> = [];

  try {
    products = await fetchTrendingProducts();
  } catch {
    products = [];
  }

  const items = products.slice(0, 5).map((product) => ({
    id: String(product.id),
    title: product.name,
    description: product.description,
    image: product.images[0],
    alt: product.name,
    href: product.href,
    badge: "Trending",
  }));

  return <HeroCarouselClient items={items} />;
}
