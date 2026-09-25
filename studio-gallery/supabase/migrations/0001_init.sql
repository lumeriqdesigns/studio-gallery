-- ============================================================
-- Lumeriq Visuals / Studio Gallery — full schema migration
-- Run once in: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run (idempotent where possible)
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Enums ----------
do $$ begin
  create type booking_status as enum ('inquiry', 'confirmed', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'void');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type order_status as enum ('pending', 'paid', 'fulfilled', 'cancelled');
exception when duplicate_object then null;
end $$;

-- ---------- Tables ----------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.galleries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  event_date date,
  cover_photo_url text,
  slug text not null unique,
  password_hash text,
  expires_at timestamptz,
  is_published boolean not null default false,
  allow_downloads boolean not null default false,
  max_downloads integer,
  created_at timestamptz not null default now()
);

create index if not exists galleries_slug_idx on public.galleries(slug);
create index if not exists galleries_client_id_idx on public.galleries(client_id);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  storage_path text not null,
  thumbnail_path text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists photos_gallery_id_idx on public.photos(gallery_id);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  gallery_id uuid references public.galleries(id) on delete set null,
  title text not null,
  event_date date,
  location text,
  status booking_status not null default 'inquiry',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists bookings_client_id_idx on public.bookings(client_id);
create index if not exists bookings_status_idx on public.bookings(status);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  invoice_number text not null unique,
  status invoice_status not null default 'draft',
  line_items jsonb not null default '[]'::jsonb,
  amount_total numeric(12,2) not null default 0,
  stripe_payment_link text,
  due_date date,
  created_at timestamptz not null default now()
);

create index if not exists invoices_client_id_idx on public.invoices(client_id);
create index if not exists invoices_status_idx on public.invoices(status);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid references public.galleries(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  stripe_checkout_session_id text,
  status order_status not null default 'pending',
  line_items jsonb not null default '[]'::jsonb,
  amount_total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists orders_gallery_id_idx on public.orders(gallery_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_stripe_session_idx on public.orders(stripe_checkout_session_id);

-- ---------- Row Level Security ----------
alter table public.clients enable row level security;
alter table public.galleries enable row level security;
alter table public.photos enable row level security;
alter table public.bookings enable row level security;
alter table public.invoices enable row level security;
alter table public.orders enable row level security;

-- Drop existing policies if re-running
do $$ begin
  -- clients
  drop policy if exists "Admin full access clients" on public.clients;
  drop policy if exists "Public insert clients for booking" on public.clients;
  -- galleries
  drop policy if exists "Admin full access galleries" on public.galleries;
  drop policy if exists "Public read published galleries" on public.galleries;
  -- photos
  drop policy if exists "Admin full access photos" on public.photos;
  drop policy if exists "Public read photos of published galleries" on public.photos;
  -- bookings
  drop policy if exists "Admin full access bookings" on public.bookings;
  drop policy if exists "Public insert inquiry bookings" on public.bookings;
  -- invoices
  drop policy if exists "Admin full access invoices" on public.invoices;
  -- orders
  drop policy if exists "Admin full access orders" on public.orders;
end $$;

-- Admin (authenticated photographer) full access
create policy "Admin full access clients"
  on public.clients for all to authenticated
  using (true) with check (true);

create policy "Admin full access galleries"
  on public.galleries for all to authenticated
  using (true) with check (true);

create policy "Admin full access photos"
  on public.photos for all to authenticated
  using (true) with check (true);

create policy "Admin full access bookings"
  on public.bookings for all to authenticated
  using (true) with check (true);

create policy "Admin full access invoices"
  on public.invoices for all to authenticated
  using (true) with check (true);

create policy "Admin full access orders"
  on public.orders for all to authenticated
  using (true) with check (true);

-- Public: read published galleries + their photos
create policy "Public read published galleries"
  on public.galleries for select
  to anon, authenticated
  using (is_published = true);

create policy "Public read photos of published galleries"
  on public.photos for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.galleries g
      where g.id = photos.gallery_id and g.is_published = true
    )
  );

-- Public: book a session form
create policy "Public insert clients for booking"
  on public.clients for insert
  to anon
  with check (true);

create policy "Public insert inquiry bookings"
  on public.bookings for insert
  to anon
  with check (status = 'inquiry');

-- ---------- Storage bucket ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery-photos',
  'gallery-photos',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies
do $$ begin
  drop policy if exists "Admin upload gallery photos" on storage.objects;
  drop policy if exists "Admin update gallery photos" on storage.objects;
  drop policy if exists "Admin delete gallery photos" on storage.objects;
  drop policy if exists "Admin read gallery photos" on storage.objects;
  drop policy if exists "Public read published gallery photos" on storage.objects;
  drop policy if exists "Public read gallery photos" on storage.objects;
end $$;

create policy "Admin upload gallery photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery-photos');

create policy "Admin update gallery photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'gallery-photos');

create policy "Admin delete gallery photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery-photos');

create policy "Admin read gallery photos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'gallery-photos');

create policy "Public read gallery photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'gallery-photos');
