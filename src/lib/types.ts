export type CategorySlug =
  | "women"
  | "men"
  | "wellness"
  | "perfumes"
  | "turaren-wuta";

export type IconName =
  | "leaf"
  | "droplet"
  | "shield"
  | "sparkles"
  | "heart"
  | "bottle"
  | "jar"
  | "dumbbell"
  | "cart"
  | "truck"
  | "headset"
  | "globe"
  | "flame"
  | "search";

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  description: string;
  icon: IconName;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategorySlug;
  price: number;
  compareAtPrice?: number;
  shortDescription: string;
  description: string;
  tags: string[];
  icon: IconName;
  imageUrls: string[];
  stock: number;
  rating: number;
  reviewsCount: number;
  featured?: boolean;
  createdAt: string;
}
