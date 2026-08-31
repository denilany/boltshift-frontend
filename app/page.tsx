import { Suspense } from "react";
import { HeroCarousel } from "@/components/hero/hero-carousel";
import { Navbar, NavbarMobile } from "@/components/navigation/navbar";
import { VendorScroller } from "@/components/vendor-story/vendor-stories";
import { ProductCategory } from "@/components/category-section/product-category"
import { HotDealsCollection } from "@/components/hot-deals-section/hot-deals-collection";
import { FeaturedProducts } from "@/components/featured-products-section/featured-products"
import { FeaturedStoreSection } from "@/components/store-card/store-section";
import { SpecialOfferSection } from "@/components/special-offer/Special-offer-collection";
import { PopularCardSection } from "@/components/popular-products/popular-card-section";
import {
  TrendingProductsSection,
  TrendingProductsSectionLoading,
} from "@/components/trending-products/trending-products-section";
import { ReviewSection } from "@/components/reviews/reviews-section";
import { Footer } from "@/components/footer/footer-section";

export default function Home() {
  return (
    <div id="landing-page" className="w-full">
      <div>
        <div className="hidden md:block"> <Navbar /> </div>
        <div className="block md:hidden"> <NavbarMobile showFilterButton={false} /> </div>
      </div>

      <VendorScroller />
      <HeroCarousel />
      <ProductCategory />
      <HotDealsCollection />
      <FeaturedProducts />
      <FeaturedStoreSection />
      <SpecialOfferSection />
      <PopularCardSection />
      <Suspense fallback={<TrendingProductsSectionLoading />}>
        <TrendingProductsSection />
      </Suspense>
      <ReviewSection />
      <Footer />
    </div>
  );
}
