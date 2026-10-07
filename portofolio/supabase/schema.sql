-- Jalankan seluruh file ini di Supabase > SQL Editor > New query > Run
create extension if not exists pgcrypto;

-- ADMIN: hanya user yang masuk tabel ini yang bisa mengubah data
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null default '[NAMA SAYA]', title text, bio text, about text, email text,
  github text, instagram text, linkedin text, whatsapp text, avatar_url text, cv_url text,
  updated_at timestamptz default now());
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null, category text not null default 'web', description text not null default '',
  tech text[] not null default '{}', image_url text, demo_url text, repo_url text, created_at timestamptz default now());
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null, category text not null default 'frontend',
  level int not null default 50 check (level between 0 and 100), created_at timestamptz default now());
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  role text not null, company text not null, period text not null, description text not null default '',
  sort int not null default 0, created_at timestamptz default now());
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 5 and 150 and email ~* '^\S+@\S+\.\S+$'),
  message text not null check (char_length(message) between 5 and 2000),
  is_read boolean not null default false, created_at timestamptz default now());

-- ROW LEVEL SECURITY
alter table public.admins enable row level security;
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.experiences enable row level security;
alter table public.messages enable row level security;

drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select to authenticated using (user_id = auth.uid());

do $$ declare t text; begin
  foreach t in array array['profiles','projects','skills','experiences'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop; end $$;

-- MESSAGES: publik hanya boleh INSERT (pesan baru selalu belum dibaca); admin boleh baca/ubah/hapus
drop policy if exists "public send" on public.messages;
drop policy if exists "admin manage" on public.messages;
create policy "public send" on public.messages for insert to anon, authenticated with check (is_read = false);
create policy "admin manage" on public.messages for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- STORAGE: bucket publik untuk gambar, hanya admin yang boleh upload/ubah/hapus
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 5242880, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "img public read" on storage.objects;
drop policy if exists "img admin insert" on storage.objects;
drop policy if exists "img admin update" on storage.objects;
drop policy if exists "img admin delete" on storage.objects;
create policy "img public read" on storage.objects for select to anon, authenticated using (bucket_id = 'project-images');
create policy "img admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'project-images' and public.is_admin());
create policy "img admin update" on storage.objects for update to authenticated using (bucket_id = 'project-images' and public.is_admin());
create policy "img admin delete" on storage.objects for delete to authenticated using (bucket_id = 'project-images' and public.is_admin());

-- DATA DUMMY (hapus/ubah lewat admin.html)
insert into public.profiles (full_name,title,bio,about,email,github,instagram,linkedin,whatsapp)
select '[NAMA SAYA]','Full-Stack Web Developer','Saya membangun website modern, cepat, dan aman, dari antarmuka hingga database.',
 'Saya developer yang fokus pada web modern dengan HTML, Tailwind CSS, JavaScript, dan Supabase. Saya suka mengubah ide menjadi produk nyata.',
 'email@example.com','https://github.com/','https://instagram.com/','https://linkedin.com/','https://wa.me/6281234567890'
where not exists (select 1 from public.profiles);

insert into public.projects (title,category,description,tech) select * from (values
 ('E-Commerce Website','web','Toko online lengkap dengan katalog, keranjang, dan checkout.',array['HTML','Tailwind','Supabase']),
 ('Class Website','web','Website kelas berisi jadwal, galeri kegiatan, dan pengumuman.',array['HTML','Tailwind','JavaScript']),
 ('Library Management System','app','Sistem perpustakaan untuk data buku, anggota, dan peminjaman.',array['JavaScript','PostgreSQL','Supabase']),
 ('Personal Portfolio','web','Portfolio pribadi bergaya futuristik dengan dashboard admin.',array['HTML','Tailwind','Supabase']),
 ('Roblox Account Store','web','Etalase penjualan akun Roblox dengan filter dan detail produk.',array['HTML','Tailwind','JavaScript']),
 ('Smart Security Gate','iot','Gerbang pintar berbasis ESP32 dengan log akses real-time di web.',array['ESP32','C++','Supabase'])
) v(a,b,c,d) where not exists (select 1 from public.projects);

insert into public.skills (name,category,level) select * from (values
 ('HTML5','frontend',92),('Tailwind CSS','frontend',90),('JavaScript','frontend',85),('Supabase','backend',80),
 ('PostgreSQL','backend',75),('Auth & RLS','backend',78),('Git & GitHub','tools',82),('Vercel','tools',80)
) v(a,b,c) where not exists (select 1 from public.skills);

insert into public.experiences (role,company,period,description,sort) select * from (values
 ('Freelance Web Developer','Self-employed','2023 - Sekarang','Membangun website toko online, company profile, dan sistem informasi untuk klien.',3),
 ('IoT & Web Project','Sekolah / Kampus','2022 - 2023','Mengembangkan Smart Security Gate dengan dashboard monitoring berbasis web.',2),
 ('Web Development Learner','Belajar Mandiri','2021 - 2022','Mendalami HTML, CSS, JavaScript dan membuat puluhan project latihan.',1)
) v(a,b,c,d,e) where not exists (select 1 from public.experiences);

-- SETELAH membuat user admin di Authentication > Users, jalankan (ganti email):
-- insert into public.admins (user_id) select id from auth.users where email = 'EMAIL-ADMIN-ANDA';
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
