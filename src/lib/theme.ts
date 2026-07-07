import { CategorySlug } from "./types";

interface CategoryStyle {
  gradient: string;
  textClass: string;
}

export const categoryStyles: Record<CategorySlug, CategoryStyle> = {
  women: {
    gradient: "from-brand-blush via-brand-cream to-brand-white",
    textClass: "text-brand-black",
  },
  men: {
    gradient: "from-brand-black via-brand-taupe-dark to-brand-taupe",
    textClass: "text-brand-white",
  },
  wellness: {
    gradient: "from-brand-sage via-brand-cream to-brand-white",
    textClass: "text-brand-black",
  },
  perfumes: {
    gradient: "from-brand-black via-brand-black to-brand-taupe",
    textClass: "text-brand-white",
  },
  "turaren-wuta": {
    gradient: "from-brand-taupe-dark via-brand-taupe to-brand-blush",
    textClass: "text-brand-white",
  },
};
