"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Icon from "@/components/icons";
import BackButton from "@/components/BackButton";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const { error: insertError } = await supabase.from("support_messages").insert({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
    });

    setSubmitting(false);

    if (insertError) {
      console.error("Failed to send support message:", insertError.message);
      setError("Something went wrong sending your message. Please try again.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="container-page flex flex-col items-center gap-5 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/20 text-brand-brown">
          <Icon name="headset" className="h-8 w-8" />
        </span>
        <h1 className="font-heading text-3xl text-brand-black md:text-4xl">
          Message Sent
        </h1>
        <p className="max-w-md text-sm text-brand-black/60">
          Thanks for reaching out. Our team will get back to you as soon as
          possible.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-full bg-brand-brown px-6 py-3 font-accent text-sm font-semibold text-brand-white hover:bg-brand-gold"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <BackButton fallbackHref="/" className="mb-4" />

      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold/15 text-brand-brown">
          <Icon name="headset" className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-heading text-3xl text-brand-black md:text-4xl">
          Get in Touch
        </h1>
        <p className="mt-3 text-sm text-brand-black/60">
          Have a question about an order, a product, or anything else? Send
          us a message and we&apos;ll respond as soon as we can.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-8 flex max-w-xl flex-col gap-4 rounded-2xl border border-brand-black/10 bg-brand-white p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="name" label="Full Name" placeholder="Amina Bello" required />
          <Field
            name="email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-accent text-xs font-medium text-brand-black/70">
            Message
          </span>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="How can we help?"
            className="rounded-lg border border-brand-black/15 bg-brand-cream/40 px-3.5 py-2.5 text-sm text-brand-black placeholder:text-brand-black/30 focus:border-brand-gold focus:outline-none"
          />
        </label>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 rounded-full bg-brand-brown px-6 py-3 font-accent text-sm font-semibold text-brand-white hover:bg-brand-gold disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Send Message"}
        </button>
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
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
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
