"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Icon from "./icons";

export default function AddToCartButton({
  productId,
  disabled = false,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(productId, quantity);
    setAdded(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-brand-black/15">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center text-lg text-brand-black/70 hover:text-brand-taupe"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center font-accent font-medium">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-11 w-11 items-center justify-center text-lg text-brand-black/70 hover:text-brand-taupe"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-black px-6 py-3 font-accent text-sm font-semibold text-brand-white transition-colors hover:bg-brand-taupe disabled:cursor-not-allowed disabled:bg-brand-black/30"
        >
          <Icon name="cart" className="h-4 w-4" />
          {disabled ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>

      {added && (
        <p className="text-sm text-brand-sage-dark">
          Added to cart —{" "}
          <Link href="/cart" className="underline hover:text-brand-taupe">
            view cart
          </Link>
        </p>
      )}
    </div>
  );
}
