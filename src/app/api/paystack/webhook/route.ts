import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Backup confirmation path: if a customer pays but closes the browser
// before the checkout page's own /api/paystack/verify call fires (network
// drop, tab closed, popup blocked from reporting back), Paystack still
// calls this webhook directly so the order gets marked paid regardless.
// Configure this URL in Paystack Dashboard > Settings > API Keys & Webhooks
// once deployed (https://yourdomain.com/api/paystack/webhook).
export async function POST(request: Request) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const signature = request.headers.get("x-paystack-signature");
  const rawBody = await request.text();

  if (!secretKey) {
    console.error("PAYSTACK_SECRET_KEY not set; rejecting webhook.");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const expectedSignature = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const tx = event.data;
    const reference: string = tx.reference;

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, total, payment_status")
      .eq("order_number", reference)
      .maybeSingle();

    if (order && order.payment_status !== "paid") {
      const amountMatchesOrder = tx.amount === Math.round(Number(order.total) * 100);
      if (amountMatchesOrder && tx.status === "success") {
        await supabaseAdmin
          .from("orders")
          .update({ payment_status: "paid", payment_reference: reference })
          .eq("id", order.id);
      }
    }
  }

  // Paystack expects a fast 200 regardless of what we did with the event.
  return NextResponse.json({ received: true });
}
