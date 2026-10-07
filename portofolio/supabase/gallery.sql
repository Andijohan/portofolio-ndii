-- Jalankan di Supabase > SQL Editor (aman dijalankan berulang)
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null, caption text not null default '',
  image_url text not null, created_at timestamptz default now());
alter table public.gallery enable row level security;
drop policy if exists "public read" on public.gallery;
drop policy if exists "admin write" on public.gallery;
create policy "public read" on public.gallery for select to anon, authenticated using (true);
create policy "admin write" on public.gallery for all to authenticated using (public.is_admin()) with check (public.is_admin());
