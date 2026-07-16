"use client";

import { useEffect, useState } from "react";
import { Review } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { fetchProductReviews, submitReview } from "@/lib/reviewQueries";
import StarRating from "./StarRating";
import StarRatingInput from "./StarRatingInput";

export default function ReviewsSection({
  productId,
  onReviewSubmitted,
}: {
  productId: string;
  onReviewSubmitted?: () => void;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicking off a fetch triggered by productId change
    setLoading(true);
    fetchProductReviews(productId).then((data) => {
      if (!cancelled) {
        setReviews(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    const created = await submitReview({ productId, customerName: name, rating, comment });
    setSubmitting(false);

    if (!created) {
      setError("Something went wrong submitting your review. Please try again.");
      return;
    }

    setReviews((prev) => [created, ...prev]);
    setName("");
    setRating(0);
    setComment("");
    setShowForm(false);
    onReviewSubmitted?.();
  }

  return (
    <div className="mt-16 border-t border-brand-black/10 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-2xl text-brand-black">
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full border border-brand-brown px-5 py-2 font-accent text-sm font-semibold text-brand-brown transition-colors hover:bg-brand-brown hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
        >
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-4 rounded-2xl border border-brand-black/10 bg-brand-white p-6"
        >
          <div>
            <span className="font-accent text-xs font-medium text-brand-black/70">
              Your Rating
            </span>
            <div className="mt-1.5">
              <StarRatingInput value={rating} onChange={setRating} />
            </div>
          </div>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-accent text-xs font-medium text-brand-black/70">
              Your Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Amina Bello"
              className="rounded-lg border border-brand-black/15 bg-brand-cream/40 px-3.5 py-2.5 text-sm text-brand-black placeholder:text-brand-black/30 focus:border-brand-gold focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-accent text-xs font-medium text-brand-black/70">
              Your Review
            </span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
              maxLength={2000}
              placeholder="What did you think of this product?"
              className="rounded-lg border border-brand-black/15 bg-brand-cream/40 px-3.5 py-2.5 text-sm text-brand-black placeholder:text-brand-black/30 focus:border-brand-gold focus:outline-none"
            />
          </label>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="self-start rounded-full bg-brand-brown px-6 py-2.5 font-accent text-sm font-semibold text-brand-white transition-colors hover:bg-brand-gold disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      <div className="mt-8 flex flex-col gap-6">
        {loading && (
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-1/3 rounded bg-brand-black/5" />
            <div className="h-4 w-2/3 rounded bg-brand-black/5" />
          </div>
        )}

        {!loading && reviews.length === 0 && (
          <p className="text-sm text-brand-black/60">
            No reviews yet. Be the first to share your experience.
          </p>
        )}

        {!loading &&
          reviews.map((review) => (
            <div key={review.id} className="border-b border-brand-black/10 pb-6 last:border-b-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-accent text-sm font-semibold text-brand-black">
                  {review.customerName}
                </span>
                <span className="text-xs text-brand-black/50">{formatDate(review.createdAt)}</span>
              </div>
              <div className="mt-1.5">
                <StarRating rating={review.rating} />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-brand-black/70">{review.comment}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
