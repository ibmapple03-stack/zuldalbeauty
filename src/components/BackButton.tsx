"use client";

import { useRouter } from "next/navigation";

export default function BackButton({
  fallbackHref = "/",
  label = "Back",
  className = "",
}: {
  fallbackHref?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  function handleClick() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border border-brand-black/15 bg-brand-white px-4 py-2 font-accent text-xs font-medium text-brand-black/70 transition-colors hover:border-brand-gold hover:text-brand-gold ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}
