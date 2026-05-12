create table if not exists public.weekly_orders (
  id bigserial primary key,
  week integer not null,
  store text not null,
  total_orders integer not null,
  unique (week, store)
);

create index if not exists idx_wo_week  on public.weekly_orders(week);
create index if not exists idx_wo_store on public.weekly_orders(store);

alter table public.weekly_orders enable row level security;
create policy "allow_all_weekly_orders" on public.weekly_orders for all using (true) with check (true);
