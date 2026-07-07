import Link from "next/link";
import { Category } from "@/lib/types";
import { categoryStyles } from "@/lib/theme";
import Icon from "./icons";

export default function CategoryCard({ category }: { category: Category }) {
  const style = categoryStyles[category.slug];

  return (
    <Link
      href={`/shop/${category.slug}`}
      className="group relative flex h-56 flex-col justify-end overflow-hidden rounded-2xl p-5"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${style.gradient} transition-transform duration-300 group-hover:scale-105`}
      />
      <Icon
        name={category.icon}
        className={`absolute -right-4 -top-4 h-28 w-28 opacity-15 ${style.textClass}`}
      />
      <div className="relative">
        <h3 className={`font-heading text-2xl ${style.textClass}`}>
          {category.name}
        </h3>
        <p
          className={`mt-1 text-sm font-accent ${style.textClass} opacity-80`}
        >
          {category.tagline}
        </p>
        <span
          className={`mt-3 inline-flex items-center gap-1 text-xs font-accent font-semibold uppercase tracking-wide ${style.textClass}`}
        >
          Shop Now
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M7.5 4.5 13 10l-5.5 5.5-1.4-1.4L10.2 10 6.1 5.9z" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
