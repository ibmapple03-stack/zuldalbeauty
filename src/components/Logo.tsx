import Link from "next/link";
import Image from "next/image";

type LogoProps = {
  variant?: "full" | "compact";
  className?: string;
};

export default function Logo({ variant = "full", className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-3 group ${className}`}
      aria-label="Zuldal Beauty & Wellness home"
    >
      <Image
        src="/logo-mark.jpg"
        alt=""
        width={1254}
        height={1254}
        priority
        className="h-9 w-9 shrink-0 md:h-10 md:w-10 object-contain"
      />
      {variant === "full" && (
        <span className="flex flex-col leading-none">
          <span className="font-heading text-xl md:text-2xl tracking-wide text-brand-black">
            ZULDAL
          </span>
          <span className="font-accent text-[9px] md:text-[10px] tracking-[0.25em] text-brand-taupe uppercase mt-0.5">
            Beauty &amp; Wellness
          </span>
        </span>
      )}
    </Link>
  );
}
