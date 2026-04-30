-- Refunds table
create table if not exists public.refunds (
  id bigserial primary key,
  country text,
  store text not null,
  order_date date,
  order_start_time timestamptz,
  order_dropoff_time timestamptz,
  order_id bigint,
  split_stacked text,
  picker_id bigint,
  picker_name text,
  rider_id bigint,
  sku text,
  product_name text,
  category_l1 text,
  category_l2 text,
  supplier_name text,
  event text,
  ccr3 text,
  origin text,
  refund numeric(10,4) default 0,
  compensation numeric(10,4) default 0,
  refund_and_comp numeric(10,4) default 0,
  week integer,
  upload_batch_id text,
  created_at timestamptz default now()
);

-- Product Failure table
create table if not exists public.product_failures (
  id bigserial primary key,
  store text not null,
  order_id bigint,
  order_date date,
  order_placement_time timestamptz,
  sku text,
  sku_name text,
  qty_ordered integer,
  qty_delivered integer,
  on_hand_qty_before integer,
  on_hand_qty_delta integer,
  on_hand_qty_after integer,
  reserved_qty_before integer,
  reserved_qty_delta integer,
  sales_buffer integer,
  im_avail integer,
  im_avail_minus_qty_ord integer,
  pf_root_cause text,
  week integer,
  picker_name text,
  upload_batch_id text,
  created_at timestamptz default now()
);

-- Upload batches tracking
create table if not exists public.upload_batches (
  id text primary key,
  filename text,
  uploaded_at timestamptz default now(),
  refund_count integer default 0,
  pf_count integer default 0,
  stores text[],
  week_range text
);

-- Action plans table
create table if not exists public.action_plans (
  id bigserial primary key,
  store text not null,
  priority integer,
  category text,
  action text not null,
  owner text,
  timeline text,
  status text default 'pending',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_refunds_store on public.refunds(store);
create index if not exists idx_refunds_week on public.refunds(week);
create index if not exists idx_refunds_ccr3 on public.refunds(ccr3);
create index if not exists idx_pf_store on public.product_failures(store);
create index if not exists idx_pf_week on public.product_failures(week);
create index if not exists idx_pf_cause on public.product_failures(pf_root_cause);

-- Enable RLS
alter table public.refunds enable row level security;
alter table public.product_failures enable row level security;
alter table public.upload_batches enable row level security;
alter table public.action_plans enable row level security;

-- Allow all operations (public dashboard - can lock down with auth later)
create policy "allow_all_refunds" on public.refunds for all using (true) with check (true);
create policy "allow_all_pf" on public.product_failures for all using (true) with check (true);
create policy "allow_all_batches" on public.upload_batches for all using (true) with check (true);
create policy "allow_all_plans" on public.action_plans for all using (true) with check (true);

-- Seed action plans
insert into public.action_plans (store, priority, category, action, owner, timeline, status) values
-- NBOF1 TimauRd
('NBOF1 - TimauRd', 1, 'Inventory Accuracy', 'Daily cycle count of top 50 PF SKUs (herbs, Kraute mixes, bread, produce) every morning before first order', 'Ops Manager / Shift Lead', 'Immediate', 'pending'),
('NBOF1 - TimauRd', 1, 'Inventory Accuracy', 'Real-time shrinkage write-off: mandatory system update within 15 mins of any damage/expiry disposal', 'All Pickers', 'Immediate', 'pending'),
('NBOF1 - TimauRd', 1, 'Inventory Accuracy', 'End-of-shift reconciliation: pickers must scan and confirm physical qty of assigned shelf locations before clock-off', 'Shift Lead', 'Week 1', 'pending'),
('NBOF1 - TimauRd', 1, 'Inventory Accuracy', 'Ghost stock alert: daily report of SKUs with On Hand > 0 but 0 sales in 48hrs → auto-trigger physical check', 'Ops Manager', 'Week 2', 'pending'),
('NBOF1 - TimauRd', 2, 'Missing Items', 'Pre-seal tote check: mandatory 2-item scan verification before tote is sealed especially during evening shift 15:00–21:00', 'Ops Manager', 'Week 1', 'pending'),
('NBOF1 - TimauRd', 2, 'Missing Items', 'Unavailable item flagging SOP: if item not found, picker must flag in-app immediately — zero tolerance for silent omissions', 'All Pickers', 'Immediate', 'pending'),
('NBOF1 - TimauRd', 2, 'Missing Items', 'Evening shift replenishment roster: assign dedicated replenishment duty 14:00–17:00 for top no-found SKUs', 'Shift Lead', 'Week 1', 'pending'),
('NBOF1 - TimauRd', 3, 'Supplier Quality', 'Formal performance review with Cyka Fresh Limited: present 347-incident data, issue SLA with quality thresholds and penalty clause', 'Ops Manager + Procurement', 'Week 1', 'pending'),
('NBOF1 - TimauRd', 3, 'Supplier Quality', 'Enhanced inbound QC for Cyka Fresh deliveries: 100% visual inspection; reject any consignment with >5% visible defects', 'Receiving Team', 'Immediate', 'pending'),
('NBOF1 - TimauRd', 3, 'Supplier Quality', 'ISINYA FEEDS egg packaging escalation: share 59-incident data across 4 egg SKUs, request reinforced carton packaging', 'Procurement', 'Week 1', 'pending'),
('NBOF1 - TimauRd', 3, 'Supplier Quality', 'In-store egg handling SOP: designate shelf level, no stacking >2 high, dedicated cooling zone. Egg handling re-briefing for all pickers', 'Ops Manager', 'Immediate', 'pending'),
('NBOF1 - TimauRd', 4, 'Picker Performance', '1-on-1 reviews with dual-risk pickers: Kevin Nyabuto (206), Brown Masinde (195), Killian Kamau (187), Kiprono Brian (178)', 'Ops Manager', 'This week', 'pending'),
('NBOF1 - TimauRd', 4, 'Picker Performance', 'Buddy system: pair high-nSFR pickers with top performers for 3–5 shifts to observe and correct picking technique', 'Shift Lead', 'Week 1-2', 'pending'),
('NBOF1 - TimauRd', 5, 'Stacked Orders', 'Enhanced bag labelling: every order bag must have colour-coded order ID label — no unmarked bags leave the store', 'Ops Manager', 'Week 1', 'pending'),
('NBOF1 - TimauRd', 5, 'Stacked Orders', 'Stacked order rider briefing: mandatory confirmation of which bag belongs to which drop point before leaving store', 'Shift Lead', 'Immediate', 'pending'),
-- NBOF3 Safari
('NBOF3 - Safari', 1, 'Inventory Accuracy', 'Daily cycle count of top PF SKUs (White Cap Lager, Cabbage, Lettuce, Basil, Parsley) before first order', 'Ops Manager / Shift Lead', 'Immediate', 'pending'),
('NBOF3 - Safari', 1, 'Inventory Accuracy', 'Real-time shrinkage write-off protocol: mandatory system update within 15 mins of any damage/expiry disposal', 'All Pickers', 'Immediate', 'pending'),
('NBOF3 - Safari', 2, 'Picker Performance', '1-on-1 reviews with top-risk pickers: Centrine Omelo (159), Brian Mwendia (142), Ivy Maina (135), David Murithi (148), Peter Ochieng (149)', 'Ops Manager', 'This week', 'pending'),
('NBOF3 - Safari', 2, 'Picker Performance', 'Wrong Item retraining: Centrine Omelo leads wrong item count — barcode scanning audit and SKU similarity training', 'Shift Lead', 'Week 1', 'pending'),
('NBOF3 - Safari', 3, 'Supplier Quality', 'Cyka Fresh performance review at Safari level: 90 incidents, primarily Potatoes, Bananas, Lettuce, Onions', 'Ops Manager + Procurement', 'Week 1', 'pending'),
('NBOF3 - Safari', 3, 'Supplier Quality', 'Enhanced inbound QC for Cyka Fresh deliveries at Safari: visual inspection and immediate rejection protocol', 'Receiving Team', 'Immediate', 'pending'),
('NBOF3 - Safari', 4, 'Missing Items', 'Pre-seal tote check during peak hours: mandatory scan verification before bag handed to rider', 'Ops Manager', 'Week 1', 'pending'),
('NBOF3 - Safari', 5, 'Stacked Orders', 'Colour-coded bag labelling for stacked orders to prevent wrong order delivery', 'Ops Manager', 'Week 1', 'pending');
