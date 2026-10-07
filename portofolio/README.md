# Portfolio — HTML + Tailwind + Vanilla JS + Supabase

## 1. Menjalankan lokal
Buka folder di VS Code → klik kanan `index.html` → *Open with Live Server*, atau jalankan `npx serve .` / `python3 -m http.server 8000`, lalu buka `http://localhost:8000`.
Tanpa konfigurasi Supabase, website tampil dengan data demo (contact form & admin butuh Supabase).

## 2. Membuat project Supabase
Daftar di supabase.com → **New project** → tunggu selesai.

## 3. Memasukkan SQL
**SQL Editor → New query** → tempel isi `supabase/schema.sql` → **Run**. (Membuat tabel, RLS, bucket `project-images`, policy storage, dan data dummy.)

## 4. Membuat admin
1. **Authentication → Users → Add user → Create new user** (centang *Auto Confirm User*), isi email & password.
2. Di SQL Editor jalankan (ganti emailnya):
   `insert into public.admins (user_id) select id from auth.users where email = 'EMAIL-ADMIN-ANDA';`
3. Buka `/admin.html` dan login. Nonaktifkan signup publik: **Authentication → Sign In / Providers → matikan "Allow new users to sign up"**.

## 5. Menghubungkan Supabase
**Project Settings → API**, salin *Project URL* dan *anon public key* ke `js/supabase.js`. Jangan pernah memakai `service_role` key.

## 6. Deploy ke Vercel
Push folder ke GitHub → vercel.com → **Add New → Project** → import repo → Framework: **Other**, tanpa build command → **Deploy**.
Lalu di Supabase **Authentication → URL Configuration**, isi Site URL dengan domain Vercel Anda.

## Sertifikat
Login admin → menu **Certificates** → Tambah → isi nama, penerbit, tahun, dan upload foto sertifikat.
Jika Supabase sudah dibuat sebelum fitur ini ada, jalankan `supabase/certificates.sql` di SQL Editor.

## Galeri kegiatan
Login admin → menu **Gallery** → Tambah → isi judul, keterangan, dan upload foto kegiatan.
Jika Supabase sudah dibuat sebelum fitur ini ada, jalankan `supabase/gallery.sql` di SQL Editor.

## Mengganti data pribadi
Login admin → menu **Profile** (nama, bio, email, GitHub/Instagram/LinkedIn/WhatsApp, foto, CV).
CV: taruh file di `assets/cv/cv.pdf` (ganti file placeholder), atau isi URL CV di Profile.
