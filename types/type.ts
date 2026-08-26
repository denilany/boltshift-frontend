import { Category, Subcategory } from "@/types/category/category";

type HeroItem = {
  id?: string;
  title: string;
  description: string;
  image: string;
  badge?: string;
  alt: string;
  href: string;
};

type CategoryItem = {
  id?: string;
  image: string;
  name: string;
  slug: string;
  category: string;
};

export type Variant = {
  color: string;
  sizes: string[];
};

type Product = {
  id: number | string;
  slug?: string;
  images: string[];
  name: string;
  description: string;
  price: number;
  progress: number;
  itemsLeft: number;
  ratings: number;
  reviews: number;
  discountPercent?: number;
  newArrival?: boolean;
  trending?: boolean;
  hotDealToday?: boolean;
  featured?: boolean;
  popular?: boolean;
  specialOffer?: boolean;
  brand?: string;

  category: Category;
  subcategory: Subcategory;

  vendor: string;

  variants: Variant[];
};

// Card variants
type ProductVariant =
  | "default"        // 1:1 
  | "wide"           // 21:10
  | "countdown"      // centered + timer
  | "horizontal"     // image left
  | "centered"      // centered content
  | "catalog";

type Review = {
  id: number;
  name: string;
  avatar?: string,
  date: string;
  rating: number;
  reviewHeading: string;
  reviewText: string;
  isEdited?: boolean;
  productUploads?: string[];
  reactions: {
    likes: number;
    dislikes: number;
  };
  product: {
    id: number;
    name: string;
    image: string;
    price: number;
    category: string;
    subcategory: string;
    vendor: string;
  };
};

type FilterOption = {
  id: string;
  label: string;
  value: string | number;
};

export type FilterSection =
  | {
    id: string;
    type: "range";
    title: string;
    minPlaceholder?: string;
    maxPlaceholder?: string;
  }
  | {
    id: string;
    type: "rating";
    title: string;
    options: {
      id: string;
      stars: number;
    }[];
  }
  | {
    id: string;
    type: "checkbox";
    title: string;
    options: FilterOption[];
  }
  | {
    id: string;
    type: "tags";
    title: string;
    options: FilterOption[];
  }
  | {
    id: string;
    type: "toggle";
    title: string;
  }
  | {
    id: string;
    type: "nested";
    title: string;
    options: {
      id: string;
      label: string;
      children?: FilterOption[];
    }[];
  };


export type { /* Vendor */ HeroItem, CategoryItem, Product, ProductVariant, Review, FilterOption };
