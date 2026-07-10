"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCartProducts } from "@/hooks/useCartProducts";
import { formatNaira } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { payWithPaystack, PaystackChannel } from "@/lib/paystack";
import ProductImage from "@/components/ProductImage";
import Icon from "@/components/icons";
import BackButton from "@/components/BackButton";

const SHIPPING_FEE = 2500;
const FREE_SHIPPING_THRESHOLD = 50000;

type PaymentMethod = "card" | "transfer" | "delivery";
type OnlinePaymentMethod = "card" | "transfer";

const PAYSTACK_CHANNELS: Record<OnlinePaymentMethod, PaystackChannel[]> = {
  card: ["card"],
  transfer: ["bank_transfer"],
};

const paymentOptions: { value: PaymentMethod; label: string; hint: string }[] = [
  { value: "card", label: "Debit / Credit Card", hint: "Visa, Mastercard, Verve — via Paystack" },
  { value: "transfer", label: "Bank Transfer", hint: "Instant confirmation — via Paystack" },
  { value: "delivery", label: "Pay on Delivery", hint: "Pay cash when it arrives" },
];

function isOnlinePayment(method: PaymentMethod): method is OnlinePaymentMethod {
  return method === "card" || method === "transfer";
}

interface PendingOrder {
  id: string;
  orderNumber: string;
  email: string;
  method: OnlinePaymentMethod;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { productMap, loading: productsLoading, subtotal } = useCartProducts(items);
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [placing, setPlacing] = useState(false);
  const [payingWithPaystack, setPayingWithPaystack] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  async function launchPaystackPayment(order: PendingOrder) {
    setPayingWithPaystack(true);
    setSubmitError("");

    try {
      const result = await payWithPaystack({
        email: order.email,
        amountNaira: total,
        reference: order.orderNumber,
        channels: PAYSTACK_CHANNELS[order.method],
        metadata: { order_id: order.id },
      });

      if (!result) {
        setSubmitError("Payment was not completed. You can try again below.");
        setPayingWithPaystack(false);
        setPlacing(false);
        return;
      }

      const verifyRes = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: result.reference, orderId: order.id }),
      });
      const verifyJson = await verifyRes.json();

      if (!verifyJson.success) {
        setSubmitError(
          verifyJson.error ?? "We couldn't confirm your payment. Please try again."
        );
        setPayingWithPaystack(false);
        setPlacing(false);
        return;
      }

      clearCart();
      router.push(
        `/checkout/success?order=${order.orderNumber}&total=${total}&payment=${order.method}&email=${encodeURIComponent(order.email)}`
      );
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong starting payment.");
      setPayingWithPaystack(false);
      setPlacing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError("");

    // Retrying after a cancelled/failed Paystack attempt — the order and its
    // items already exist, just relaunch payment for the same order.
    if (pendingOrder) {
      setPlacing(true);
      await launchPaystackPayment(pendingOrder);
      return;
    }

    setPlacing(true);

    const formData = new FormData(e.currentTarget);
    const orderNumber = `ZB-${Date.now().toString().slice(-6)}`;
    const email = String(formData.get("email") ?? "");

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: String(formData.get("name") ?? ""),
        email,
        phone: String(formData.get("phone") ?? ""),
        address: String(formData.get("address") ?? ""),
        city: String(formData.get("city") ?? ""),
        state: String(formData.get("state") ?? ""),
        payment_method: payment,
        subtotal,
        shipping,
        total,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Failed to place order:", orderError?.message);
      setSubmitError("Something went wrong placing your order. Please try again.");
      setPlacing(false);
      return;
    }

    const orderItems = items.map((item) => {
      const product = productMap[item.productId];
      return {
        order_id: order.id,
        product_id: item.productId,
        product_name: product?.name ?? "Unknown product",
        price: product?.price ?? 0,
        quantity: item.quantity,
      };
    });

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Failed to save order items:", itemsError.message);
      setSubmitError(
        itemsError.message.includes("insufficient_stock")
          ? "One of the items in your cart just sold out. Please update your cart and try again."
          : "Something went wrong saving your order items. Please try again."
      );
      setPlacing(false);
      return;
    }

    if (isOnlinePayment(payment)) {
      const newPendingOrder: PendingOrder = { id: order.id, orderNumber, email, method: payment };
      setPendingOrder(newPendingOrder);
      await launchPaystackPayment(newPendingOrder);
      return;
    }

    clearCart();
    router.push(
      `/checkout/success?order=${orderNumber}&total=${total}&payment=${payment}&email=${encodeURIComponent(email)}`
    );
  }

  if (productsLoading) return <div className="container-page py-20" />;

  if (items.length === 0 && !placing) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <BackButton fallbackHref="/cart" />
        <Icon name="cart" className="mt-4 h-12 w-12 text-brand-black/20" />
        <h1 className="font-heading text-3xl text-brand-black">
          Nothing to check out
        </h1>
        <p className="text-sm text-brand-black/60">
          Your cart is empty right now.
        </p>
        <Link
          href="/shop"
          className="rounded-full bg-brand-brown px-6 py-3 font-accent text-sm font-semibold text-brand-white hover:bg-brand-gold"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <BackButton fallbackHref="/cart" className="mb-4" />
      <h1 className="font-heading text-3xl text-brand-black md:text-4xl">
        Checkout
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-10 lg:grid-cols-3">
        <fieldset disabled={Boolean(pendingOrder)} className="flex flex-col gap-6 lg:col-span-2">
          <section className="rounded-2xl border border-brand-black/10 bg-brand-white p-6">
            <h2 className="font-heading text-xl text-brand-black">
              Contact Information
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field name="name" label="Full Name" placeholder="Amina Bello" required />
              <Field name="phone" label="Phone Number" type="tel" placeholder="080 1234 5678" required />
              <Field
                name="email"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                required
                full
              />
            </div>
          </section>

          <section className="rounded-2xl border border-brand-black/10 bg-brand-white p-6">
            <h2 className="font-heading text-xl text-brand-black">
              Shipping Address
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field name="address" label="Street Address" placeholder="12 Ahmadu Bello Way" required full />
              <Field name="city" label="City" placeholder="Kano" required />
              <Field name="state" label="State" placeholder="Kano State" required />
            </div>
          </section>

          <section className="rounded-2xl border border-brand-black/10 bg-brand-white p-6">
            <h2 className="font-heading text-xl text-brand-black">
              Payment Method
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {paymentOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                    payment === opt.value
                      ? "border-brand-gold bg-brand-gold/5"
                      : "border-brand-black/10"
                  } ${pendingOrder ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={payment === opt.value}
                      onChange={() => setPayment(opt.value)}
                      disabled={Boolean(pendingOrder)}
                      className="accent-brand-gold"
                    />
                    <span>
                      <span className="block text-sm font-medium text-brand-black">
                        {opt.label}
                      </span>
                      <span className="block text-xs text-brand-black/50">
                        {opt.hint}
                      </span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-brand-black/50">
              <Icon name="shield" className="h-4 w-4 text-brand-brown" />
              {pendingOrder
                ? "Your order is saved — payment method is locked in for this order."
                : "Card and bank transfer payments are processed securely by Paystack and confirmed instantly. Pay-on-delivery orders are confirmed manually by our team."}
            </p>
          </section>
        </fieldset>

        <div className="h-fit rounded-2xl border border-brand-black/10 bg-brand-white p-6">
          <h2 className="font-heading text-xl text-brand-black">
            Order Summary
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            {items.map((item) => {
              const product = productMap[item.productId];
              if (!product) return null;
              return (
                <div key={item.productId} className="flex items-center gap-3">
                  <ProductImage
                    product={product}
                    className="h-14 w-14 shrink-0 rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm text-brand-black">
                      {product.name}
                    </p>
                    <p className="text-xs text-brand-black/50">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-accent font-medium text-brand-black">
                    {formatNaira(product.price * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-col gap-2 border-t border-brand-black/10 pt-4 text-sm">
            <div className="flex justify-between text-brand-black/70">
              <span>Subtotal</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            <div className="flex justify-between text-brand-black/70">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatNaira(shipping)}</span>
            </div>
          </div>
          <div className="mt-3 flex justify-between border-t border-brand-black/10 pt-4 font-accent font-semibold text-brand-black">
            <span>Total</span>
            <span>{formatNaira(total)}</span>
          </div>

          {submitError && (
            <p className="mt-3 text-xs text-red-600">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={placing}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-brown px-6 py-3 font-accent text-sm font-semibold text-brand-white hover:bg-brand-gold disabled:opacity-60"
          >
            {placing
              ? payingWithPaystack
                ? "Waiting for payment..."
                : pendingOrder
                  ? "Retrying..."
                  : "Placing Order..."
              : pendingOrder
                ? `Retry Payment · ${formatNaira(total)}`
                : `Place Order · ${formatNaira(total)}`}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required,
  full,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${full ? "sm:col-span-2" : ""}`}>
      <span className="font-accent text-xs font-medium text-brand-black/70">
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="rounded-lg border border-brand-black/15 bg-brand-cream/40 px-3.5 py-2.5 text-sm text-brand-black placeholder:text-brand-black/30 focus:border-brand-gold focus:outline-none"
      />
    </label>
  );
}
