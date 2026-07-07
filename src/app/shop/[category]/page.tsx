import { notFound } from "next/navigation";
import { categories, getCategory } from "@/lib/categories";
import ShopGrid from "@/components/ShopGrid";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  return {
    title: cat
      ? `${cat.name} | Zuldal Beauty & Wellness`
      : "Shop | Zuldal Beauty & Wellness",
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  return <ShopGrid category={cat.slug} />;
}
