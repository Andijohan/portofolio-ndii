/* ====== KONFIGURASI: isi dari Supabase > Project Settings > API ======
   Pakai anon/public key SAJA. JANGAN pernah memakai service_role key di frontend. */
const CONFIG = {
  SUPABASE_URL: 'https://hpgbsibwyjwcnzlyeryn.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_x1uPhwKS1hnB3Be5vl9kUw_FSwuKIx8',
  BUCKET: 'project-images',
  CV_URL: 'assets/cv/cv.pdf'
};
const SB_READY = !CONFIG.SUPABASE_URL.includes('YOUR-PROJECT') && !CONFIG.SUPABASE_ANON_KEY.includes('YOUR-ANON');
const sb = SB_READY ? window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY) : null;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = u => /^(https?:\/\/|assets\/|\/)/i.test(u || '') ? u : '#';
function toast(msg, err = false) {
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.className = 'toast show' + (err ? ' err' : '');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.className = 'toast', 3200);
}
