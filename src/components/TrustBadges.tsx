import Icon from "./icons";

const badges = [
  {
    icon: "shield" as const,
    title: "Trusted",
    body: "We source only authentic and reliable products.",
  },
  {
    icon: "sparkles" as const,
    title: "Curated",
    body: "Every product is carefully selected with you in mind.",
  },
  {
    icon: "heart" as const,
    title: "For Everyone",
    body: "Unisex products for all skin types and lifestyles.",
  },
  {
    icon: "leaf" as const,
    title: "Safe & Effective",
    body: "We prioritize quality, safety and effectiveness.",
  },
];

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {badges.map((b) => (
        <div
          key={b.title}
          className="flex flex-col items-center gap-2 rounded-2xl border border-brand-black/10 bg-brand-white p-5 text-center"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-sage/15 text-brand-sage-dark">
            <Icon name={b.icon} className="h-5 w-5" />
          </span>
          <p className="font-accent text-sm font-semibold text-brand-black">
            {b.title}
          </p>
          <p className="text-xs text-brand-black/60">{b.body}</p>
        </div>
      ))}
    </div>
  );
}
