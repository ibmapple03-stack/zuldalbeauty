"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import Icon from "./icons";
import { useCart } from "@/context/CartContext";
import { categories } from "@/lib/categories";

export default function Header() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-black/10 bg-brand-cream/95 backdrop-blur">
      <div className="bg-brand-black text-brand-white">
        <div className="container-page flex items-center justify-center gap-2 py-1.5 text-center text-[11px] font-accent tracking-wide">
          <Icon name="truck" className="h-3 w-3" />
          <span>Curated with care. Chosen for results. Beauty for everyone.</span>
        </div>
      </div>

      <div className="container-page flex items-center justify-between gap-4 py-3">
        <Logo />

        <nav className="hidden lg:flex items-center gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop/${cat.slug}`}
              className="font-accent text-sm font-medium text-brand-black/80 hover:text-brand-taupe transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/shop"
            className="font-accent text-sm font-medium text-brand-black/80 hover:text-brand-taupe transition-colors"
          >
            All Products
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-1.5 rounded-full bg-brand-black px-4 py-2 text-xs font-accent font-medium text-brand-white hover:bg-brand-taupe transition-colors"
          >
            <Icon name="cart" className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-blush px-1 text-[10px] font-semibold text-brand-black">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-black/15 text-brand-black"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="lg:hidden border-t border-brand-black/10 bg-brand-white">
          <div className="container-page flex flex-col py-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop/${cat.slug}`}
                className="py-2.5 font-accent text-sm font-medium text-brand-black/80 border-b border-brand-black/5"
                onClick={() => setMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/shop"
              className="py-2.5 font-accent text-sm font-medium text-brand-black/80"
              onClick={() => setMenuOpen(false)}
            >
              All Products
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
