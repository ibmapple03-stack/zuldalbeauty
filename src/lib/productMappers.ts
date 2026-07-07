import { Product } from "./types";

export interface ProductRow {
  id: string;
  name: string;
  brand: string;
  category: Product["category"];
  price: number;
  compare_at_price: number | null;
  short_description: string;
  description: string;
  tags: string[];
  icon: Product["icon"];
  image_urls: string[];
  stock: number;
  rating: number;
  reviews_count: number;
  featured: boolean;
  created_at: string;
}

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    shortDescription: row.short_description,
    description: row.description,
    tags: row.tags,
    icon: row.icon,
    imageUrls: row.image_urls ?? [],
    stock: row.stock,
    rating: row.rating,
    reviewsCount: row.reviews_count,
    featured: row.featured,
    createdAt: row.created_at,
  };
}
