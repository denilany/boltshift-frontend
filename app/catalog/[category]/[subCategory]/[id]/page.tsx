import { BreadcrumbComponent } from "@/components/breadcrumb/breadcrumb";
import { SpecialOfferCard } from "@/components/special-offer/special-offer-card";
import { PopularCardContent } from "@/components/popular-products/content";
import { FeaturedStoreCard } from "@/components/store-card/store-card";
import { RatingBreakdown } from "@/components/reviews/product-review";
import { PaginationLinks } from "@/components/pagination/pagination";
import { BuyerReviewCard } from "@/components/reviews/buyer-review";
import { StartRating } from "@/components/rating/rating";
import { Button } from "@/components/ui/button";
import { ProductReviews } from "@/lib/reviews";
import { SubmitReview } from "@/components/reviews/review-modal";
import { PenLine } from "lucide-react";
import { formatCategoryName } from "@/lib/catalog";
import { fetchAllProducts } from "@/lib/products/all-products";
import { fetchProductById } from "@/lib/products/product-details";

const reviews = ProductReviews();

export default async function ProductDetails({
  params,
}: {
  params: Promise<{ category: string; subCategory: string; id: string }>;
}) {
  const { category, subCategory, id } = await params;
  const product =
    (await fetchProductById(id)) ??
    (await fetchAllProducts()).find(
      (p) => String(p.id) === id || p.slug === id,
    );
  const productName = product?.name || id;

  const title = formatCategoryName(category);
  const icon = "/popular-categories-icons/Shopping-bags.svg";
  const alt = "Shopping bags icon";

  const items = [
    { label: "Catalog", href: "/catalog" },
    { label: formatCategoryName(category), href: `/catalog/${category}` },
    { label: formatCategoryName(subCategory), href: `/catalog/${category}/${subCategory}` },
    { label: productName },
  ];

  return (
    <>
      <BreadcrumbComponent items={items} />
      <div className="pt-4 pb-12">
        {product ? <SpecialOfferCard product={product} /> : null}
      </div>

      {/* Product description */}
      <div className="max-w-full py-12 flex flex-col gap-10 justify-around">
        <p className="text-2xl font-semibold">Description</p>
        <div className="max-w-lg text-sm text-muted-foreground">
          <p>{product?.description}</p>
        </div>
      </div>

      {/* Product specification */}
      <div className="max-w-full py-12 flex flex-col gap-10 justify-around">
        <p className="text-2xl font-semibold">Specifications</p>
        <div className="text-sm text-muted-foreground">
          <ul className="list-disc list-outside ml-5">
            {product?.specifications &&
              Object.entries(product.specifications).map(([key, value]) => (
                <li key={key}>
                  <span className="font-semibold">
                    {key.replaceAll("_", " ")}:
                  </span>{" "}
                  {value}
                </li>
              ))}
          </ul>
        </div>
      </div>

      {/* Product Reviews */}
      <div className="py-12 flex flex-col gap-10">
        <div className="max-w-full p-12 flex flex-col gap-5 justify-around bg-muted rounded-2xl border">
          <p className="text-2xl font-semibold">Reviews</p>

          <div className="w-full flex flex-col gap-4 md:flex-row">
            {/* Rating and Review */}
            <div className="py-4 pr-8 flex flex-col gap-4 justify-end">
              {/* Average rating */}
              <div className="flex gap-2">
                <p className="text-6xl font-bold text-primary">
                  {product?.ratings}
                </p>
                <div className="flex flex-col gap-2 justify-around">
                  <StartRating value={product?.ratings ?? 0} readonly />
                  <p className="text-sm font-semibold">
                    {product?.reviews} reviews
                  </p>
                </div>
              </div>

              {/* Review Button */}
              <SubmitReview
                trigger={
                  <Button className="w-64 h-11 px-4 py-2.5 flex gap-1.5 text-base hover:cursor-pointer">
                    <PenLine />
                    Share a Review
                  </Button>
                }

              />
            </div>

            {/* Rating by population */}
            <RatingBreakdown />
          </div>
        </div>

        {/* Buyers reviews */}
        <div className="w-full flex flex-col gap-10">
          {reviews.map((review) => (
            <BuyerReviewCard key={review.id} review={review} />
          ))}
        </div>

        <PaginationLinks />
      </div>

      <div className="max-w-full py-12 flex flex-col gap-10 justify-around">
        <p className="text-2xl font-semibold">Related Products</p>
        <PopularCardContent />
      </div>

      <div className="max-w-full py-12 flex flex-col gap-10 justify-around">
        <p className="text-2xl font-semibold">More from this Store</p>
        <FeaturedStoreCard />
      </div>
    </>
  );
}
