import Link from "next/link";
import Logo from "./Logo";
import Icon from "./icons";
import { categories } from "@/lib/categories";

const trustPoints = [
  {
    icon: "globe" as const,
    title: "Curated From Trusted Brands",
    body: "We offer products from reliable local and international brands.",
  },
  {
    icon: "shield" as const,
    title: "Secure Shopping Experience",
    body: "Your data and payments are safe with us.",
  },
  {
    icon: "truck" as const,
    title: "Fast & Reliable Delivery",
    body: "We deliver your beauty essentials with care.",
  },
  {
    icon: "headset" as const,
    title: "Customer Care You Can Count On",
    body: "We're here to help you every step of the way.",
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-brand-black/10 bg-brand-white">
      <div className="container-page grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        {trustPoints.map((point) => (
          <div key={point.title} className="flex flex-col gap-2">
            <Icon name={point.icon} className="h-6 w-6 text-brand-taupe" />
            <p className="font-accent text-sm font-semibold text-brand-black">
              {point.title}
            </p>
            <p className="text-xs text-brand-black/60">{point.body}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-brand-black/10">
        <div className="container-page grid gap-10 py-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-brand-black/60">
              Curated with care. Chosen for results. Beauty for everyone.
            </p>
            <p className="mt-1 font-heading italic text-brand-taupe">
              Wellness for life.
            </p>
          </div>

          <div>
            <h4 className="font-accent text-xs font-semibold uppercase tracking-wide text-brand-black/50">
              Shop by Category
            </h4>
            <ul className="mt-4 space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/shop/${cat.slug}`}
                    className="text-sm text-brand-black/70 hover:text-brand-taupe"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-accent text-xs font-semibold uppercase tracking-wide text-brand-black/50">
              Marketplace
            </h4>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/shop" className="text-sm text-brand-black/70 hover:text-brand-taupe">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm text-brand-black/70 hover:text-brand-taupe">
                  Your Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-accent text-xs font-semibold uppercase tracking-wide text-brand-black/50">
              Our Promise
            </h4>
            <p className="mt-4 text-sm text-brand-black/70">
              We bring the best of beauty to you. From global brands to
              everyday essentials, everything we offer is chosen with care so
              you can shop with confidence and love what you use.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-sage/20 px-3 py-1.5 text-[11px] font-accent font-semibold text-brand-sage-dark">
              <Icon name="shield" className="h-3.5 w-3.5" />
              Zuldal Approved. You Can Trust.
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-brand-black/10 bg-brand-black py-4">
        <div className="container-page flex flex-col items-center justify-between gap-2 text-center text-xs text-brand-white/60 md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Zuldal Beauty &amp; Wellness. All
            rights reserved.
          </p>
          <p className="font-accent tracking-wide">
            Your Trusted Beauty Marketplace
          </p>
        </div>
      </div>
    </footer>
  );
}
