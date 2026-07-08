import Link from "next/link";
import { Product } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import ProductImage from "./ProductImage";
import QuickAddButton from "./QuickAddButton";
import StarRating from "./StarRating";

export default function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-black/10 bg-brand-white transition-shadow hover:shadow-lg">
      <Link href={`/product/${product.id}`} className="block">
        <ProductImage product={product} className="aspect-[4/5] w-full" />
      </Link>
      {product.compareAtPrice && (
        <span className="absolute left-3 top-3 rounded-full bg-brand-gold px-2.5 py-1 text-[10px] font-accent font-semibold uppercase tracking-wide text-brand-black">
          Sale
        </span>
      )}
      {outOfStock && (
        <span className="absolute left-3 top-3 rounded-full bg-brand-black/80 px-2.5 py-1 text-[10px] font-accent font-semibold uppercase tracking-wide text-brand-white">
          Sold Out
        </span>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="font-accent text-[11px] uppercase tracking-wide text-brand-gold">
          {product.brand}
        </p>
        <Link href={`/product/${product.id}`}>
          <h3 className="font-heading text-base leading-snug text-brand-black line-clamp-2 hover:text-brand-gold">
            {product.name}
          </h3>
        </Link>
        <StarRating rating={product.rating} reviewsCount={product.reviewsCount} />
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-accent font-semibold text-brand-black">
              {formatNaira(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-brand-black/40 line-through">
                {formatNaira(product.compareAtPrice)}
              </span>
            )}
          </div>
          {!outOfStock && <QuickAddButton productId={product.id} />}
        </div>
      </div>
    </div>
  );
}
