import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PopularCardContent } from "@/components/popular-products/content";
import { Separator } from "@/components/ui/separator";
import { fetchPopularProducts } from "@/lib/products/popular-products";

const CATEGORIES = [
  { id: "feature", label: "Feature Products" },
  { id: "topRated", label: "Top Rated Products" },
  { id: "onsale", label: "Onsale Products" },
] as const;

export async function PopularProductsCard() {
  const defaultValue = CATEGORIES[0].id;
  const products = await fetchPopularProducts();

  return (
    <Tabs defaultValue={defaultValue} className="gap-10">
      <TabsList
        variant="line"
        className="inline-flex h-8 max-w-full gap-3 overflow-x-auto overflow-y-hidden whitespace-nowrap scroll-smooth scrollbar-hide pl-15 md:pl-0"
      >
        {CATEGORIES.map((category) => (
          <TabsTrigger
            key={category.id}
            value={category.id}
            className="flex-none! shrink-0 whitespace-nowrap hover:cursor-pointer data-[state=active]:primary data-[state=active]:text-primary dark:data-[state=active]:text-primary hover:text-primary dark:hover:text-primary after:bg-primary"
          >
            {category.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <Separator className="-mt-10" />

      {CATEGORIES.map((category) => (
        <TabsContent key={category.id} value={category.id}>
          <PopularCardContent key={category.id} products={products} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
