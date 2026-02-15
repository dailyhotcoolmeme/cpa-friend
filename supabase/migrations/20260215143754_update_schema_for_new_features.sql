-- 1. Update staff table
alter table public.staff add column if not exists photo_url text;
alter table public.staff add column if not exists highlights text[];

-- 2. Create services table
create table if not exists public.services (
  id bigint primary key generated always as identity,
  name text not null,
  description text[] default '{}',
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

-- 3. Create posts table
create table if not exists public.posts (
  id bigint primary key generated always as identity,
  title text not null,
  category text not null,
  summary text,
  content text not null,
  thumbnail text,
  created_at timestamp with time zone default now()
);

-- 4. Enable RLS
alter table public.services enable row level security;
alter table public.posts enable row level security;

-- 5. Create Public Policies (Simple for now, matching common patterns)
create policy "Allow public read for services" on public.services for select using (true);
create policy "Allow public read for posts" on public.posts for select using (true);
create policy "Allow public all for services" on public.services for all using (true);
create policy "Allow public all for posts" on public.posts for all using (true);
create policy "Allow public all for staff" on public.staff for all using (true);
