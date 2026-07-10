"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatNaira } from "@/lib/format";
import { searchProductsTypeahead, ProductSearchResult } from "@/lib/productQueries";
import ProductImage from "./ProductImage";
import Icon from "./icons";

const LISTBOX_ID = "search-results-listbox";

export default function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const term = query.trim();
  const showDropdown = open && term.length >= 2;

  useEffect(() => {
    if (term.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing stale results when the term drops below the search threshold
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const handle = window.setTimeout(() => {
      searchProductsTypeahead(term, 6).then((r) => {
        if (!cancelled) {
          setResults(r);
          setLoading(false);
        }
      });
    }, 275);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [term]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset highlight when the result set changes
    setActiveIndex(-1);
  }, [results]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function goToProduct(id: string) {
    setOpen(false);
    inputRef.current?.blur();
    router.push(`/product/${id}`);
  }

  function goToResultsPage() {
    if (!term) return;
    setOpen(false);
    inputRef.current?.blur();
    router.push(`/shop?q=${encodeURIComponent(term)}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        goToProduct(results[activeIndex].id);
      } else {
        goToResultsPage();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Icon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-black/40"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={LISTBOX_ID}
          aria-activedescendant={
            activeIndex >= 0 && results[activeIndex]
              ? `search-option-${results[activeIndex].id}`
              : undefined
          }
          className="w-full rounded-full border border-brand-black/15 bg-brand-white py-2 pl-9 pr-3 text-sm text-brand-black placeholder:text-brand-black/40 focus:border-brand-gold focus:outline-none"
        />
      </div>

      {showDropdown && (
        <div
          id={LISTBOX_ID}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-brand-black/10 bg-brand-white shadow-lg"
        >
          {loading && results.length === 0 && (
            <div className="flex flex-col gap-3 p-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex animate-pulse items-center gap-3">
                  <div className="h-12 w-12 shrink-0 rounded-lg bg-brand-black/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/2 rounded bg-brand-black/5" />
                    <div className="h-3 w-1/3 rounded bg-brand-black/5" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && results.length === 0 && (
            <p className="p-4 text-sm text-brand-black/50">
              No products found for &ldquo;{term}&rdquo;.
            </p>
          )}

          {results.length > 0 && (
            <ul>
              {results.map((result, index) => (
                <li
                  key={result.id}
                  role="option"
                  id={`search-option-${result.id}`}
                  aria-selected={index === activeIndex}
                >
                  <button
                    type="button"
                    onClick={() => goToProduct(result.id)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      index === activeIndex ? "bg-brand-cream" : ""
                    }`}
                  >
                    <ProductImage
                      product={{
                        name: result.name,
                        category: result.category,
                        icon: result.icon,
                        imageUrls: result.imageUrl ? [result.imageUrl] : [],
                      }}
                      className="h-12 w-12 shrink-0 rounded-lg"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-accent text-[11px] uppercase tracking-wide text-brand-gold">
                        {result.brand}
                      </span>
                      <span className="block truncate text-sm text-brand-black">
                        {result.name}
                      </span>
                    </span>
                    <span className="shrink-0 font-accent text-sm font-medium text-brand-black">
                      {formatNaira(result.price)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {term && (
            <button
              type="button"
              onClick={goToResultsPage}
              className="block w-full border-t border-brand-black/10 px-3 py-2.5 text-center font-accent text-xs font-semibold text-brand-gold hover:bg-brand-cream"
            >
              See all results for &ldquo;{term}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
