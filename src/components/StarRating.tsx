export default function StarRating({
  rating,
  reviewsCount,
  className = "",
}: {
  rating: number;
  reviewsCount?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex text-brand-gold" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(rating);
          return (
            <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.2}>
              <path d="M10 1.5l2.6 5.4 5.9.6-4.4 4 1.2 5.9-5.3-3-5.3 3 1.2-5.9-4.4-4 5.9-.6L10 1.5Z" />
            </svg>
          );
        })}
      </div>
      <span className="text-xs text-brand-black/60">
        {rating.toFixed(1)}
        {typeof reviewsCount === "number" ? ` (${reviewsCount})` : ""}
      </span>
    </div>
  );
}
