import { supabase } from "./supabase";
import { Product, CategorySlug, IconName } from "./types";
import { rowToProduct, ProductRow } from "./productMappers";

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "rating";

// Builds a PostgREST .or() filter string matching a search term against
// name/brand/description text columns plus an exact-match on the tags
// array (PostgREST's array operators can't do substring matches inside
// array elements, so "vegan" matches a "vegan" tag but "veg" won't).
function buildSearchFilter(term: string): string {
  const escaped = term.replace(/"/g, '\\"');
  return [
    `name.ilike."%${escaped}%"`,
    `brand.ilike."%${escaped}%"`,
    `short_description.ilike."%${escaped}%"`,
    `description.ilike."%${escaped}%"`,
    `tags.cs.{"${escaped}"}`,
  ].join(",");
}

export async function fetchProductsPage(opts: {
  category?: CategorySlug;
  search?: string;
  sort?: SortKey;
  page: number;
  pageSize: number;
}): Promise<{ products: Product[]; totalCount: number }> {
  const { category, search, sort = "featured", page, pageSize } = opts;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("products").select("*", { count: "exact" });

  if (category) query = query.eq("category", category);
  if (search && search.trim()) {
    query = query.or(buildSearchFilter(search.trim()));
  }

  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Failed to fetch products:", error.message);
    return { products: [], totalCount: 0 };
  }

  return {
    products: (data as ProductRow[]).map(rowToProduct),
    totalCount: count ?? 0,
  };
}

export interface ProductSearchResult {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: CategorySlug;
  icon: IconName;
  imageUrl: string | null;
}

export async function searchProductsTypeahead(
  term: string,
  limit = 6
): Promise<ProductSearchResult[]> {
  const trimmed = term.trim();
  if (!trimmed) return [];

  const { data, error } = await supabase
    .from("products")
    .select("id, name, brand, price, category, icon, image_urls")
    .or(buildSearchFilter(trimmed))
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (error) console.error("Failed to search products:", error.message);
    return [];
  }

  return (
    data as Pick<
      ProductRow,
      "id" | "name" | "brand" | "price" | "category" | "icon" | "image_urls"
    >[]
  ).map((row) => ({
    id: row.id,
    name: row.name,
    brand: row.brand,
    price: row.price,
    category: row.category,
    icon: row.icon,
    imageUrl: row.image_urls?.[0] ?? null,
  }));
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("Failed to fetch product:", error.message);
    return null;
  }
  return rowToProduct(data as ProductRow);
}

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("products").select("*").in("id", ids);

  if (error || !data) {
    if (error) console.error("Failed to fetch products by id:", error.message);
    return [];
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export async function fetchFeaturedProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (error) console.error("Failed to fetch featured products:", error.message);
    return [];
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export async function fetchRelatedProducts(
  category: CategorySlug,
  excludeId: string,
  limit = 4
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .neq("id", excludeId)
    .limit(limit);

  if (error || !data) {
    if (error) console.error("Failed to fetch related products:", error.message);
    return [];
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export async function fetchRecentProducts(limit = 5): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (error) console.error("Failed to fetch recent products:", error.message);
    return [];
  }
  return (data as ProductRow[]).map(rowToProduct);
}

