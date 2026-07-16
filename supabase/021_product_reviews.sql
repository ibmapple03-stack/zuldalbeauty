-- Zuldal Beauty & Wellness — customer product reviews. Open submission (no
-- accounts, no verified-purchase check) and auto-published (no moderation
-- queue), matching the guest-checkout, no-admin-app posture of the rest of
-- this schema. A trigger keeps products.rating / products.reviews_count
-- (denormalized for fast list/sort queries) in sync with the real reviews
-- table instead of the launch-seed placeholder values.
-- Run this once, after 020_customer_order_lookup_function.sql, in the
-- Supabase SQL Editor.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists reviews_product_id_idx on public.reviews(product_id);

alter table public.reviews enable row level security;

drop policy if exists "Public read reviews" on public.reviews;
create policy "Public read reviews" on public.reviews for select using (true);

drop policy if exists "Anyone can submit reviews" on public.reviews;
create policy "Anyone can submit reviews" on public.reviews for insert with check (true);

-- ---------- Keep products.rating / products.reviews_count in sync ----------

create or replace function public.refresh_product_review_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_id text := coalesce(new.product_id, old.product_id);
begin
  update public.products
  set
    reviews_count = (select count(*) from public.reviews where product_id = v_product_id),
    rating = coalesce(
      (select round(avg(rating)::numeric, 1) from public.reviews where product_id = v_product_id),
      rating
    )
  where id = v_product_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists refresh_product_review_stats on public.reviews;
create trigger refresh_product_review_stats
after insert or update or delete on public.reviews
for each row execute function public.refresh_product_review_stats();
