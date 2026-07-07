"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categories } from "@/lib/categories";
import { Product } from "@/lib/types";
import { fetchFeaturedProducts } from "@/lib/productQueries";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import TrustBadges from "@/components/TrustBadges";
import Icon from "@/components/icons";

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchFeaturedProducts(8).then((products) => {
      if (!cancelled) setFeatured(products);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-black">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-taupe/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-brand-sage/20 blur-3xl" />
        <div className="container-page relative grid gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-sage/20 px-3.5 py-1.5 text-xs font-accent font-medium text-brand-sage">
              <Icon name="heart" className="h-3.5 w-3.5" />
              Your Trusted Beauty Marketplace
            </span>
            <h1 className="mt-5 font-heading text-4xl leading-tight text-brand-white md:text-5xl">
              Curated with care.
              <br />
              Chosen for results.
            </h1>
            <p className="mt-4 max-w-md text-brand-white/70">
              Zuldal Beauty &amp; Wellness brings together trusted skincare,
              haircare, fragrance and wellness products for everyone — women,
              men, and every beauty ritual in between.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-full bg-brand-white px-6 py-3 font-accent text-sm font-semibold text-brand-black hover:bg-brand-taupe hover:text-brand-white transition-colors"
              >
                Shop All Products
              </Link>
              <Link
                href="/shop/turaren-wuta"
                className="rounded-full border border-brand-white/30 px-6 py-3 font-accent text-sm font-semibold text-brand-white hover:border-brand-white transition-colors"
              >
                Explore Turaren Wuta
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 self-center">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop/${cat.slug}`}
                className="rounded-2xl border border-brand-white/10 bg-brand-white/5 p-4 backdrop-blur transition-colors hover:bg-brand-white/10"
              >
                <Icon name={cat.icon} className="h-6 w-6 text-brand-sage" />
                <p className="mt-3 font-heading text-lg text-brand-white">
                  {cat.name}
                </p>
                <p className="text-xs text-brand-white/50">{cat.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-accent text-xs font-semibold uppercase tracking-widest text-brand-taupe">
              Shop by Section
            </p>
            <h2 className="mt-2 font-heading text-3xl text-brand-black">
              Every kind of beauty, in one marketplace
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <CategoryCard key={cat.slug} category={cat} />
          ))}
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="bg-brand-white py-16">
          <div className="container-page">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="font-accent text-xs font-semibold uppercase tracking-widest text-brand-taupe">
                  Handpicked For You
                </p>
                <h2 className="mt-2 font-heading text-3xl text-brand-black">
                  Featured Products
                </h2>
              </div>
              <Link
                href="/shop"
                className="hidden font-accent text-sm font-semibold text-brand-taupe hover:underline md:inline"
              >
                View all products &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust badges */}
      <section className="container-page py-16">
        <div className="mb-8 text-center">
          <p className="font-accent text-xs font-semibold uppercase tracking-widest text-brand-taupe">
            Brand Positioning
          </p>
          <h2 className="mt-2 font-heading text-3xl text-brand-black">
            A trusted beauty marketplace, offering carefully selected
            products from reliable brands.
          </h2>
        </div>
        <TrustBadges />
      </section>

      {/* Promise banner */}
      <section className="bg-brand-sage/15 py-14">
        <div className="container-page flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-sage text-brand-white">
            <Icon name="shield" className="h-7 w-7" />
          </span>
          <h3 className="font-heading text-2xl text-brand-black">
            Zuldal Approved. You Can Trust.
          </h3>
          <p className="max-w-xl text-sm text-brand-black/70">
            We bring the best of beauty to you. From global brands to
            everyday essentials, everything we offer is chosen with care so
            you can shop with confidence and love what you use.
          </p>
          <p className="font-heading italic text-brand-taupe">
            Beauty for everyone. Wellness for life.
          </p>
        </div>
      </section>
    </div>
  );
}
