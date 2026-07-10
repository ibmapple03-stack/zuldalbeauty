"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { categories } from "@/lib/categories";
import { CategorySlug, Product } from "@/lib/types";
import { fetchProductsPage, SortKey } from "@/lib/productQueries";
import ProductCard from "./ProductCard";
import Icon from "./icons";
import BackButton from "./BackButton";

const PAGE_SIZE = 12;

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

function ShopGridContent({ category }: { category?: CategorySlug }) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [sort, setSort] = useState<SortKey>("featured");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const activeCategory = category
    ? categories.find((c) => c.slug === category)
    : undefined;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset pagination when the filter/sort/search changes
    setPage(1);
  }, [category, sort, q]);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicking off a fetch triggered by dependency change
    setLoading(true);
    fetchProductsPage({ category, sort, search: q, page, pageSize: PAGE_SIZE }).then(
      ({ products, totalCount }) => {
        if (cancelled) return;
        setProducts(products);
        setTotalCount(totalCount);
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [category, sort, q, page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="container-page py-10">
      <BackButton fallbackHref="/" className="mb-4" />
      <div className="mb-2 flex items-center gap-1.5 text-xs text-brand-black/50">
        <Link href="/" className="hover:text-brand-gold">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-brand-gold">
          Shop
        </Link>
        {activeCategory && (
          <>
            <span>/</span>
            <span className="text-brand-black/70">{activeCategory.name}</span>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-brand-black md:text-4xl">
            {q
              ? "Search Results"
              : activeCategory
                ? activeCategory.name
                : "All Products"}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-brand-black/60">
            {q ? (
              <>
                Showing results for &ldquo;{q}&rdquo;
              </>
            ) : activeCategory ? (
              activeCategory.description
            ) : (
              "Browse our full curated marketplace of skincare, haircare, fragrance and wellness essentials."
            )}
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="font-accent text-brand-black/60">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border border-brand-black/15 bg-brand-white px-3.5 py-2 font-accent text-sm text-brand-black focus:border-brand-gold focus:outline-none"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/shop"
          className={`rounded-full px-4 py-2 text-xs font-accent font-medium transition-colors ${
            !activeCategory
              ? "bg-brand-brown text-brand-white"
              : "bg-brand-white text-brand-black/70 border border-brand-black/10 hover:border-brand-gold"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/shop/${cat.slug}`}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-accent font-medium transition-colors ${
              activeCategory?.slug === cat.slug
                ? "bg-brand-brown text-brand-white"
                : "bg-brand-white text-brand-black/70 border border-brand-black/10 hover:border-brand-gold"
            }`}
          >
            <Icon name={cat.icon} className="h-3.5 w-3.5" />
            {cat.name}
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-brand-black/5">
              <div className="aspect-[4/5] w-full rounded-t-2xl bg-brand-black/5" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-1/2 rounded bg-brand-black/10" />
                <div className="h-4 w-3/4 rounded bg-brand-black/10" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-full border border-brand-black/15 px-4 py-2 text-xs font-accent font-medium text-brand-black/70 transition-colors hover:border-brand-gold hover:text-brand-gold disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="font-accent text-xs text-brand-black/60">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-full border border-brand-black/15 px-4 py-2 text-xs font-accent font-medium text-brand-black/70 transition-colors hover:border-brand-gold hover:text-brand-gold disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Icon name="cart" className="h-10 w-10 text-brand-black/20" />
          <p className="font-heading text-xl text-brand-black/70">
            {q ? `No products match "${q}"` : "No products here yet"}
          </p>
          <p className="text-sm text-brand-black/50">
            {q
              ? "Try a different search term or browse a category."
              : "Check back soon — admins are always adding new products."}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ShopGrid({ category }: { category?: CategorySlug }) {
  return (
    <Suspense fallback={<div className="container-page py-10" />}>
      <ShopGridContent category={category} />
    </Suspense>
  );
}
