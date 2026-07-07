"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCartProducts } from "@/hooks/useCartProducts";
import { formatNaira } from "@/lib/format";
import ProductImage from "@/components/ProductImage";
import Icon from "@/components/icons";
import BackButton from "@/components/BackButton";

const FREE_SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 2500;

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalItems } = useCart();
  const { productMap, loading, subtotal } = useCartProducts(items);

  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  if (loading) {
    return <div className="container-page py-20" />;
  }

  if (items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <BackButton fallbackHref="/shop" />
        <Icon name="cart" className="mt-4 h-12 w-12 text-brand-black/20" />
        <h1 className="font-heading text-3xl text-brand-black">
          Your cart is empty
        </h1>
        <p className="text-sm text-brand-black/60">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/shop"
          className="rounded-full bg-brand-black px-6 py-3 font-accent text-sm font-semibold text-brand-white hover:bg-brand-taupe"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <BackButton fallbackHref="/shop" className="mb-4" />
      <h1 className="font-heading text-3xl text-brand-black md:text-4xl">
        Your Cart
      </h1>
      <p className="mt-1 text-sm text-brand-black/60">
        {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {items.map((item) => {
            const product = productMap[item.productId];
            if (!product) return null;
            return (
              <div
                key={item.productId}
                className="flex gap-4 rounded-2xl border border-brand-black/10 bg-brand-white p-4"
              >
                <Link href={`/product/${product.id}`} className="shrink-0">
                  <ProductImage
                    product={product}
                    className="h-24 w-24 rounded-xl"
                  />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-accent text-[11px] uppercase tracking-wide text-brand-taupe">
                        {product.brand}
                      </p>
                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-heading text-base text-brand-black hover:text-brand-taupe">
                          {product.name}
                        </h3>
                      </Link>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="h-fit text-brand-black/40 hover:text-brand-black"
                      aria-label="Remove item"
                    >
                      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={1.6}>
                        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-brand-black/15">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="flex h-8 w-8 items-center justify-center text-brand-black/70 hover:text-brand-taupe"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm font-accent font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="flex h-8 w-8 items-center justify-center text-brand-black/70 hover:text-brand-taupe"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-accent font-semibold text-brand-black">
                      {formatNaira(product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-fit rounded-2xl border border-brand-black/10 bg-brand-white p-6">
          <h2 className="font-heading text-xl text-brand-black">
            Order Summary
          </h2>
          <div className="mt-4 flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between text-brand-black/70">
              <span>Subtotal</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            <div className="flex justify-between text-brand-black/70">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatNaira(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-brand-sage-dark">
                Add {formatNaira(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
              </p>
            )}
          </div>
          <div className="mt-4 flex justify-between border-t border-brand-black/10 pt-4 font-accent font-semibold text-brand-black">
            <span>Total</span>
            <span>{formatNaira(total)}</span>
          </div>
          <Link
            href="/checkout"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-black px-6 py-3 font-accent text-sm font-semibold text-brand-white hover:bg-brand-taupe"
          >
            Proceed to Checkout
          </Link>
          <Link
            href="/shop"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-brand-black/15 px-6 py-3 font-accent text-sm font-semibold text-brand-black hover:border-brand-taupe hover:text-brand-taupe"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
