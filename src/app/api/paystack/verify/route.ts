import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Called by the checkout page right after the Paystack popup reports
// success. We don't trust the client's word for it — Paystack's own
// /transaction/verify endpoint (using the secret key) is the source of
// truth for whether money actually moved, so a customer can't fake a
// successful payment by tampering with client-side state.
export async function POST(request: Request) {
  let body: { reference?: string; orderId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const { reference, orderId } = body;
  if (!reference || !orderId) {
    return NextResponse.json(
      { success: false, error: "Missing reference or orderId." },
      { status: 400 }
    );
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { success: false, error: "Payments are not configured on the server yet." },
      { status: 500 }
    );
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("id, total, payment_status")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
  }

  if (order.payment_status === "paid") {
    return NextResponse.json({ success: true, alreadyPaid: true });
  }

  const paystackRes = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey}` }, cache: "no-store" }
  );
  const paystackJson = await paystackRes.json();

  if (!paystackRes.ok || !paystackJson?.status) {
    return NextResponse.json(
      { success: false, error: "Could not reach Paystack to verify this payment." },
      { status: 502 }
    );
  }

  const tx = paystackJson.data;
  const amountMatchesOrder = tx.amount === Math.round(Number(order.total) * 100);
  const isSuccess = tx.status === "success" && tx.currency === "NGN" && amountMatchesOrder;

  await supabaseAdmin
    .from("orders")
    .update({
      payment_status: isSuccess ? "paid" : "failed",
      payment_reference: reference,
    })
    .eq("id", orderId);

  if (!isSuccess) {
    return NextResponse.json(
      { success: false, error: "Payment could not be verified." },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
