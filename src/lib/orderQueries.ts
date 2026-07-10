import { supabase } from "./supabase";

export interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  price: number;
  quantity: number;
}

export interface OrderStatusEvent {
  status: string;
  note: string | null;
  createdAt: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  paymentStatus: string;
  trackingNumber: string | null;
  courier: string | null;
  createdAt: string;
  items: OrderItem[];
  statusEvents: OrderStatusEvent[];
}

// Calls the get_order_for_customer() Postgres function (see
// supabase/020_customer_order_lookup_function.sql), which only returns a row
// when both the order number AND the checkout email match — this is the
// only identity check available since checkout is guest-only (no accounts).
export async function lookupOrder(
  orderNumber: string,
  email: string
): Promise<CustomerOrder | null> {
  const { data, error } = await supabase.rpc("get_order_for_customer", {
    p_order_number: orderNumber.trim(),
    p_email: email.trim(),
  });

  if (error) {
    console.error("Failed to look up order:", error.message);
    return null;
  }

  return (data as CustomerOrder | null) ?? null;
}
