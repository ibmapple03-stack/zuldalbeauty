"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatNaira, formatDate } from "@/lib/format";
import { lookupOrder, CustomerOrder } from "@/lib/orderQueries";
import Icon from "@/components/icons";
import BackButton from "@/components/BackButton";

const STEPS = ["pending", "processing", "shipped", "delivered"] as const;

const STEP_LABELS: Record<(typeof STEPS)[number], string> = {
  pending: "Order Placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

function paymentLabel(value: string) {
  switch (value) {
    case "transfer":
      return "Bank Transfer";
    case "delivery":
      return "Pay on Delivery";
    default:
      return "Card Payment";
  }
}

function OrderTracker({ order }: { order: CustomerOrder }) {
  if (order.status === "cancelled") {
    return (
      <div className="mt-6 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        <Icon name="shield" className="h-4 w-4" />
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);

  return (
    <div className="mt-6 flex items-center justify-between gap-2">
      {STEPS.map((step, index) => {
        const reached = currentIndex >= index;
        return (
          <div key={step} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              <div
                className={`h-0.5 flex-1 ${index === 0 ? "invisible" : reached ? "bg-brand-gold" : "bg-brand-black/10"}`}
              />
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  reached
                    ? "bg-brand-brown text-brand-white"
                    : "bg-brand-black/10 text-brand-black/40"
                }`}
              >
                {index + 1}
              </span>
              <div
                className={`h-0.5 flex-1 ${index === STEPS.length - 1 ? "invisible" : currentIndex > index ? "bg-brand-gold" : "bg-brand-black/10"}`}
              />
            </div>
            <span
              className={`text-center text-[11px] font-accent ${reached ? "font-semibold text-brand-black" : "text-brand-black/40"}`}
            >
              {STEP_LABELS[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function OrderResult({ order }: { order: CustomerOrder }) {
  return (
    <div className="mt-8 rounded-2xl border border-brand-black/10 bg-brand-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-accent text-xs uppercase tracking-wide text-brand-black/50">
            Order Number
          </p>
          <p className="font-heading text-2xl text-brand-black">
            {order.orderNumber}
          </p>
          <p className="mt-1 text-xs text-brand-black/50">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold/15 px-3 py-1.5 text-xs font-accent font-semibold capitalize text-brand-brown">
          <Icon name="truck" className="h-3.5 w-3.5" />
          {order.status}
        </span>
      </div>

      <OrderTracker order={order} />

      {(order.trackingNumber || order.courier) && (
        <div className="mt-6 flex flex-wrap gap-6 rounded-xl bg-brand-cream/60 px-4 py-3 text-sm">
          {order.courier && (
            <div>
              <p className="text-xs text-brand-black/50">Courier</p>
              <p className="font-medium text-brand-black">{order.courier}</p>
            </div>
          )}
          {order.trackingNumber && (
            <div>
              <p className="text-xs text-brand-black/50">Tracking Number</p>
              <p className="font-medium text-brand-black">{order.trackingNumber}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 border-t border-brand-black/10 pt-5">
        <h2 className="font-heading text-lg text-brand-black">Items</h2>
        <div className="mt-3 flex flex-col gap-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-brand-black">
                {item.productName}{" "}
                <span className="text-brand-black/50">&times; {item.quantity}</span>
              </span>
              <span className="font-accent font-medium text-brand-black">
                {formatNaira(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-brand-black/10 pt-4 text-sm">
          <div className="flex justify-between text-brand-black/70">
            <span>Subtotal</span>
            <span>{formatNaira(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-brand-black/70">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? "Free" : formatNaira(order.shipping)}</span>
          </div>
          <div className="flex justify-between border-t border-brand-black/10 pt-3 font-accent font-semibold text-brand-black">
            <span>Total</span>
            <span>{formatNaira(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 border-t border-brand-black/10 pt-5 sm:grid-cols-2">
        <div>
          <h3 className="font-accent text-xs font-semibold uppercase tracking-wide text-brand-black/50">
            Shipping To
          </h3>
          <p className="mt-2 text-sm text-brand-black">{order.customerName}</p>
          <p className="text-sm text-brand-black/70">
            {order.address}, {order.city}, {order.state}
          </p>
          <p className="text-sm text-brand-black/70">{order.phone}</p>
        </div>
        <div>
          <h3 className="font-accent text-xs font-semibold uppercase tracking-wide text-brand-black/50">
            Payment
          </h3>
          <p className="mt-2 text-sm text-brand-black">
            {paymentLabel(order.paymentMethod)}
          </p>
          <p className="text-sm capitalize text-brand-black/70">
            {order.paymentStatus}
          </p>
        </div>
      </div>
    </div>
  );
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") ?? "");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  async function runLookup(number: string, mail: string) {
    if (!number.trim() || !mail.trim()) return;
    setLoading(true);
    setNotFound(false);
    setOrder(null);
    const result = await lookupOrder(number, mail);
    setLoading(false);
    if (result) {
      setOrder(result);
    } else {
      setNotFound(true);
    }
  }

  useEffect(() => {
    const prefillOrder = searchParams.get("order");
    const prefillEmail = searchParams.get("email");
    if (prefillOrder && prefillEmail) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- kicking off the prefilled lookup triggered by initial query params
      runLookup(prefillOrder, prefillEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run the prefilled lookup once, on initial load
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    runLookup(orderNumber, email);
  }

  return (
    <div className="container-page max-w-2xl py-10">
      <BackButton fallbackHref="/" className="mb-4" />
      <h1 className="font-heading text-3xl text-brand-black md:text-4xl">
        Track Your Order
      </h1>
      <p className="mt-1 text-sm text-brand-black/60">
        Enter your order number and the email address you used at checkout.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-4 rounded-2xl border border-brand-black/10 bg-brand-white p-6 sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="font-accent text-xs font-medium text-brand-black/70">
            Order Number
          </span>
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="ZB-123456"
            required
            className="rounded-lg border border-brand-black/15 bg-brand-cream/40 px-3.5 py-2.5 text-sm text-brand-black placeholder:text-brand-black/30 focus:border-brand-gold focus:outline-none"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="font-accent text-xs font-medium text-brand-black/70">
            Email Address
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="rounded-lg border border-brand-black/15 bg-brand-cream/40 px-3.5 py-2.5 text-sm text-brand-black placeholder:text-brand-black/30 focus:border-brand-gold focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-brand-brown px-6 py-3 font-accent text-sm font-semibold text-brand-white transition-colors hover:bg-brand-gold disabled:opacity-60"
        >
          {loading ? "Searching..." : "Track Order"}
        </button>
      </form>

      {notFound && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          We couldn&apos;t find an order with that number and email. Double
          check both and try again.
        </p>
      )}

      {order && <OrderResult order={order} />}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="container-page py-10" />}>
      <TrackOrderContent />
    </Suspense>
  );
}
