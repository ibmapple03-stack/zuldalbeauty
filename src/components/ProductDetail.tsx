"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import { getCategory } from "@/lib/categories";
import { fetchProductById, fetchRelatedProducts } from "@/lib/productQueries";
import ProductImage from "./ProductImage";
import ProductCard from "./ProductCard";
import AddToCartButton from "./AddToCartButton";
import StarRating from "./StarRating";
import Icon from "./icons";
import BackButton from "./BackButton";

export default function ProductDetail({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicking off a fetch triggered by id change
    setLoading(true);

    fetchProductById(id).then(async (fetched) => {
      if (cancelled) return;
      setProduct(fetched);
      setActiveImage(0);
      setLoading(false);
      if (fetched) {
        const relatedProducts = await fetchRelatedProducts(fetched.category, fetched.id, 4);
        if (!cancelled) setRelated(relatedProducts);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container-page py-20">
        <div className="grid animate-pulse gap-10 md:grid-cols-2">
          <div className="aspect-square rounded-2xl bg-brand-black/5" />
          <div className="space-y-4">
            <div className="h-4 w-24 rounded bg-brand-black/5" />
            <div className="h-8 w-2/3 rounded bg-brand-black/5" />
            <div className="h-4 w-1/3 rounded bg-brand-black/5" />
            <div className="h-24 rounded bg-brand-black/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <BackButton fallbackHref="/shop" />
        <Icon name="cart" className="mt-4 h-10 w-10 text-brand-black/20" />
        <h1 className="font-heading text-2xl text-brand-black">
          Product not found
        </h1>
        <p className="text-sm text-brand-black/60">
          This product may have been removed by an admin.
        </p>
        <Link
          href="/shop"
          className="rounded-full bg-brand-brown px-5 py-2.5 font-accent text-sm font-semibold text-brand-white hover:bg-brand-gold"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const category = getCategory(product.category);

  return (
    <div className="container-page py-10">
      <BackButton fallbackHref={`/shop/${product.category}`} className="mb-4" />
      <div className="mb-6 flex items-center gap-1.5 text-xs text-brand-black/50">
        <Link href="/" className="hover:text-brand-gold">
          Home
        </Link>
        <span>/</span>
        <Link href={`/shop/${product.category}`} className="hover:text-brand-gold">
          {category?.name}
        </Link>
        <span>/</span>
        <span className="text-brand-black/70 line-clamp-1">{product.name}</span>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <ProductImage
            product={product}
            imageIndex={activeImage}
            className="aspect-square w-full rounded-2xl"
          />
          {product.imageUrls.length > 1 && (
            <div className="mt-3 flex gap-2.5">
              {product.imageUrls.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show photo ${index + 1}`}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                    index === activeImage
                      ? "border-brand-gold"
                      : "border-transparent hover:border-brand-black/15"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URLs, not local assets */}
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="font-accent text-xs font-semibold uppercase tracking-wide text-brand-gold">
            {product.brand}
          </p>
          <h1 className="mt-2 font-heading text-3xl text-brand-black md:text-4xl">
            {product.name}
          </h1>
          <div className="mt-3">
            <StarRating rating={product.rating} reviewsCount={product.reviewsCount} />
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-accent text-2xl font-semibold text-brand-black">
              {formatNaira(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-brand-black/40 line-through">
                {formatNaira(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-brand-black/70">
            {product.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-accent font-medium text-brand-brown"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="mt-5 text-xs font-accent text-brand-black/50">
            {product.stock > 0
              ? `${product.stock} in stock`
              : "Currently out of stock"}
          </p>

          <div className="mt-4">
            <AddToCartButton productId={product.id} disabled={product.stock <= 0} />
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-brand-black/10 pt-6 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <Icon name="shield" className="h-5 w-5 text-brand-brown" />
              <span className="text-[11px] text-brand-black/60">
                Safe &amp; Effective
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Icon name="truck" className="h-5 w-5 text-brand-brown" />
              <span className="text-[11px] text-brand-black/60">
                Fast Delivery
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Icon name="heart" className="h-5 w-5 text-brand-brown" />
              <span className="text-[11px] text-brand-black/60">
                Cruelty Free
              </span>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-heading text-2xl text-brand-black">
            You might also like
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
