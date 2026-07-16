import { supabase } from "./supabase";
import { Review } from "./types";

interface ReviewRow {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

function rowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    customerName: row.customer_name,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

export async function fetchProductReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("Failed to fetch reviews:", error.message);
    return [];
  }
  return (data as ReviewRow[]).map(rowToReview);
}

export async function submitReview(input: {
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
}): Promise<Review | null> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      product_id: input.productId,
      customer_name: input.customerName.trim(),
      rating: input.rating,
      comment: input.comment.trim(),
    })
    .select("*")
    .single();

  if (error || !data) {
    if (error) console.error("Failed to submit review:", error.message);
    return null;
  }
  return rowToReview(data as ReviewRow);
}
