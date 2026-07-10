"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatNaira } from "@/lib/format";
import Icon from "@/components/icons";

function paymentLabel(value: string | null) {
  switch (value) {
    case "transfer":
      return "Bank Transfer";
    case "delivery":
      return "Pay on Delivery";
    default:
      return "Card Payment";
  }
}

function SuccessContent() {
  const params = useSearchParams();
  const order = params.get("order") ?? "ZB-000000";
  const total = Number(params.get("total") ?? 0);
  const payment = paymentLabel(params.get("payment"));
  const email = params.get("email") ?? "";

  return (
    <div className="container-page flex flex-col items-center gap-5 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/20 text-brand-brown">
        <Icon name="shield" className="h-8 w-8" />
      </span>
      <h1 className="font-heading text-3xl text-brand-black md:text-4xl">
        Order Placed Successfully
      </h1>
      <p className="max-w-md text-sm text-brand-black/60">
        Thank you for shopping with Zuldal Beauty &amp; Wellness. We&apos;ve
        received your order and we&apos;re getting it ready with care.
      </p>

      <div className="mt-2 w-full max-w-sm rounded-2xl border border-brand-black/10 bg-brand-white p-6 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-brand-black/60">Order Number</span>
          <span className="font-accent font-semibold text-brand-black">
            {order}
          </span>
        </div>
        <div className="mt-2.5 flex justify-between text-sm">
          <span className="text-brand-black/60">Payment Method</span>
          <span className="font-medium text-brand-black">{payment}</span>
        </div>
        <div className="mt-2.5 flex justify-between border-t border-brand-black/10 pt-2.5 text-sm">
          <span className="text-brand-black/60">Total Paid</span>
          <span className="font-accent font-semibold text-brand-black">
            {formatNaira(total)}
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link
          href="/shop"
          className="rounded-full bg-brand-brown px-6 py-3 font-accent text-sm font-semibold text-brand-white hover:bg-brand-gold"
        >
          Continue Shopping
        </Link>
        {email && (
          <Link
            href={`/orders?order=${encodeURIComponent(order)}&email=${encodeURIComponent(email)}`}
            className="rounded-full border border-brand-black/15 px-6 py-3 font-accent text-sm font-semibold text-brand-black hover:border-brand-gold hover:text-brand-gold"
          >
            Track This Order
          </Link>
        )}
        <Link
          href="/"
          className="rounded-full border border-brand-black/15 px-6 py-3 font-accent text-sm font-semibold text-brand-black hover:border-brand-gold hover:text-brand-gold"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container-page py-24" />}>
      <SuccessContent />
    </Suspense>
  );
}
