-- Zuldal Beauty & Wellness — lets a guest customer look up their own order
-- (for a "Track Your Order" page) without needing an account. Checkout is
-- guest-only (no auth, no user_id on orders), so the only safe way to expose
-- order data to the browser is a function that requires the caller to
-- already know both the order number AND the email used at checkout, and
-- that returns nothing at all otherwise. security definer lets this bypass
-- the "Admins read orders" RLS policy for just this one narrow lookup;
-- admin_notes is intentionally excluded from the response since it's for
-- internal use only.
-- Run this once, after 019_order_payment_status.sql, in the Supabase SQL
-- Editor.

create or replace function public.get_order_for_customer(p_order_number text, p_email text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  result json;
begin
  select * into v_order
  from public.orders
  where order_number = p_order_number
    and lower(email) = lower(trim(p_email));

  if not found then
    return null;
  end if;

  select json_build_object(
    'id', v_order.id,
    'orderNumber', v_order.order_number,
    'customerName', v_order.customer_name,
    'email', v_order.email,
    'phone', v_order.phone,
    'address', v_order.address,
    'city', v_order.city,
    'state', v_order.state,
    'paymentMethod', v_order.payment_method,
    'subtotal', v_order.subtotal,
    'shipping', v_order.shipping,
    'total', v_order.total,
    'status', v_order.status,
    'paymentStatus', v_order.payment_status,
    'trackingNumber', v_order.tracking_number,
    'courier', v_order.courier,
    'createdAt', v_order.created_at,
    'items', (
      select coalesce(json_agg(json_build_object(
        'id', oi.id,
        'productId', oi.product_id,
        'productName', oi.product_name,
        'price', oi.price,
        'quantity', oi.quantity
      )), '[]'::json)
      from public.order_items oi
      where oi.order_id = v_order.id
    ),
    'statusEvents', (
      select coalesce(json_agg(json_build_object(
        'status', e.status,
        'note', e.note,
        'createdAt', e.created_at
      ) order by e.created_at asc), '[]'::json)
      from public.order_status_events e
      where e.order_id = v_order.id
    )
  ) into result;

  return result;
end;
$$;

grant execute on function public.get_order_for_customer(text, text) to anon, authenticated;
