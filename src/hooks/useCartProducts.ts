"use client";

import { useEffect, useState } from "react";
import { CartItem } from "@/context/CartContext";
import { Product } from "@/lib/types";
import { fetchProductsByIds } from "@/lib/productQueries";

export function useCartProducts(items: CartItem[]) {
  const [productMap, setProductMap] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  const idsKey = items.map((i) => i.productId).sort().join(",");

  useEffect(() => {
    let cancelled = false;
    const ids = idsKey ? idsKey.split(",") : [];

    if (ids.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no ids to fetch, reset synchronously
      setProductMap({});
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchProductsByIds(ids).then((products) => {
      if (cancelled) return;
      setProductMap(Object.fromEntries(products.map((p) => [p.id, p])));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  const subtotal = items.reduce((sum, item) => {
    const product = productMap[item.productId];
    return product ? sum + product.price * item.quantity : sum;
  }, 0);

  return { productMap, loading, subtotal };
}
