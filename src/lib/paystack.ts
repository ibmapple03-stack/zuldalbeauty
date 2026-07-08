interface PaystackHandler {
  openIframe: () => void;
}

export type PaystackChannel =
  | "card"
  | "bank"
  | "ussd"
  | "qr"
  | "mobile_money"
  | "bank_transfer"
  | "eft";

interface PaystackSetupOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref: string;
  channels?: PaystackChannel[];
  metadata?: Record<string, unknown>;
  onClose: () => void;
  callback: (response: { reference: string }) => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: PaystackSetupOptions) => PaystackHandler;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadPaystackScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Paystack checkout can only run in the browser."));
  }
  if (window.PaystackPop) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Couldn't load the payment popup. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}

// Resolves with the transaction reference once Paystack reports success, or
// null if the customer closed the popup without paying. The reference still
// needs server-side verification before trusting it — see
// /api/paystack/verify.
export async function payWithPaystack(options: {
  email: string;
  amountNaira: number;
  reference: string;
  channels?: PaystackChannel[];
  metadata?: Record<string, unknown>;
}): Promise<{ reference: string } | null> {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error("Online payments aren't set up yet — missing Paystack public key.");
  }

  await loadPaystackScript();

  return new Promise((resolve, reject) => {
    if (!window.PaystackPop) {
      reject(new Error("Payment popup failed to initialize."));
      return;
    }

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: options.email,
      amount: Math.round(options.amountNaira * 100),
      currency: "NGN",
      ref: options.reference,
      channels: options.channels,
      metadata: options.metadata ?? {},
      onClose: () => resolve(null),
      callback: (response) => resolve({ reference: response.reference }),
    });
    handler.openIframe();
  });
}
