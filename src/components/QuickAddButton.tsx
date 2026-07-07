"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Icon from "./icons";

export default function QuickAddButton({ productId }: { productId: string }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(productId, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-full bg-brand-black px-3.5 py-2 text-xs font-accent font-medium text-brand-white transition-colors hover:bg-brand-taupe cursor-pointer"
      aria-label="Add to cart"
    >
      <Icon name="cart" className="h-3.5 w-3.5" />
      {added ? "Added" : "Add"}
    </button>
  );
}
