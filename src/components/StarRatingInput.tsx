"use client";

import { useState } from "react";

export default function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(star)}
            className="text-brand-gold transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:outline-none"
          >
            <svg
              viewBox="0 0 20 20"
              className="h-6 w-6"
              fill={filled ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={filled ? 0 : 1.2}
            >
              <path d="M10 1.5l2.6 5.4 5.9.6-4.4 4 1.2 5.9-5.3-3-5.3 3 1.2-5.9-4.4-4 5.9-.6L10 1.5Z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
