-- Jalankan di Supabase > SQL Editor (aman dijalankan berulang)
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null, issuer text not null default '', year text not null default '',
  image_url text, created_at timestamptz default now());
alter table public.certificates enable row level security;
drop policy if exists "public read" on public.certificates;
drop policy if exists "admin write" on public.certificates;
create policy "public read" on public.certificates for select to anon, authenticated using (true);
create policy "admin write" on public.certificates for all to authenticated using (public.is_admin()) with check (public.is_admin());
