const ENT = {
  projects: { title: 'Projects', order: ['created_at', false], label: r => r.title, sub: r => r.category,
    fields: [['title', 'Judul'], ['category', 'Kategori (web / app / iot)'], ['description', 'Deskripsi', 'textarea'], ['tech', 'Teknologi (pisahkan koma)'], ['demo_url', 'Demo URL (opsional)'], ['repo_url', 'Repo URL (opsional)'], ['image_url', 'Gambar project', 'file']] },
  skills: { title: 'Skills', order: ['level', false], label: r => r.name, sub: r => `${r.category} · ${r.level}%`,
    fields: [['name', 'Nama skill'], ['category', 'Kategori (frontend / backend / tools)'], ['level', 'Level (0-100)', 'number']] },
  experiences: { title: 'Experience', order: ['sort', false], label: r => r.role, sub: r => `${r.company} · ${r.period}`,
    fields: [['role', 'Posisi'], ['company', 'Perusahaan / Instansi'], ['period', 'Periode (mis. 2023 - Sekarang)'], ['description', 'Deskripsi', 'textarea'], ['sort', 'Urutan (angka besar tampil duluan)', 'number']] }
};
ENT.certificates = { title: 'Certificates', order: ['created_at', false], label: r => r.title, sub: r => `${r.issuer} · ${r.year}`,
  fields: [['title', 'Nama sertifikat'], ['issuer', 'Penerbit (mis. Dicoding)'], ['year', 'Tahun'], ['image_url', 'Foto sertifikat', 'file']] };
ENT.gallery = { title: 'Gallery', needImage: true, order: ['created_at', false], label: r => r.title, sub: r => r.caption || '-',
  fields: [['title', 'Judul kegiatan'], ['caption', 'Keterangan singkat (opsional)'], ['image_url', 'Foto kegiatan', 'file']] };
const view = $('#view'); let cache = {}, current = 'dashboard';
const q = async p => { const { data, error } = await p; if (error) { toast(error.message, true); throw error; } return data; };

async function boot() {
  if (!sb) { $('#loginBox').classList.remove('hidden'); $('#loginBox').innerHTML = '<div class="glass p-8 max-w-md"><h1 class="font-bold text-xl">Supabase belum dikonfigurasi</h1><p class="muted mt-2">Isi SUPABASE_URL dan SUPABASE_ANON_KEY di js/supabase.js.</p></div>'; return; }
  if (await Auth.isAdmin()) { $('#loginBox').classList.add('hidden'); $('#app').classList.remove('hidden'); show(location.hash.slice(1) || 'dashboard'); }
  else { $('#app').classList.add('hidden'); $('#loginBox').classList.remove('hidden'); }
}
sb && sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT') boot(); });

$('#loginForm').onsubmit = async e => {
  e.preventDefault(); const f = e.target;
  try {
    await Auth.login(f.email.value.trim(), f.password.value);
    if (!(await Auth.isAdmin())) { await Auth.logout(); return toast('Akun ini bukan admin. Tambahkan ke tabel admins (lihat README).', true); }
    f.reset(); boot();
  } catch (err) { toast('Login gagal: ' + err.message, true); }
};
$('#logoutBtn').onclick = async () => { await Auth.logout(); location.hash = ''; boot(); };
$('.side').onclick = e => { const a = e.target.closest('[data-v]'); if (a) show(a.dataset.v); };

async function show(v) {
  current = v; location.hash = v;
  $$('.side [data-v]').forEach(a => a.classList.toggle('active', a.dataset.v === v));
  view.innerHTML = '<p class="muted">Memuat...</p>';
  try {
    if (v === 'dashboard') await dash(); else if (v === 'messages') await msgs(); else if (v === 'profile') await prof(); else if (ENT[v]) await list(v);
    else show('dashboard');
  } catch (e) { view.innerHTML = '<p class="text-red-400">Gagal memuat data.</p>'; }
  unread();
}
async function unread() {
  const { count } = await sb.from('messages').select('*', { count: 'exact', head: true }).eq('is_read', false);
  const b = $('#badge'); b.textContent = count || ''; b.classList.toggle('hidden', !count);
  return count || 0;
}
const cnt = async t => (await sb.from(t).select('*', { count: 'exact', head: true })).count || 0;
async function dash() {
  const [p, s, x, m] = await Promise.all([cnt('projects'), cnt('skills'), cnt('experiences'), unread()]);
  view.innerHTML = `<h1 class="h2">Dashboard</h1><div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">` +
    [['Total Projects', p], ['Total Skills', s], ['Total Experience', x], ['Unread Messages', m]].map(c => `<div class="glass card p-6"><p class="muted text-sm">${c[0]}</p><p class="text-4xl font-extrabold grad-text mt-2">${c[1]}</p></div>`).join('') + '</div>';
}

async function list(k) {
  const c = ENT[k], rows = await q(sb.from(k).select('*').order(c.order[0], { ascending: c.order[1] }));
  cache[k] = rows;
  view.innerHTML = `<div class="flex justify-between items-center flex-wrap gap-3"><h1 class="h2">${c.title}</h1><button class="btn" data-add>+ Tambah</button></div>
  <div class="grid gap-3 mt-6">${rows.length ? rows.map(r => `<div class="glass p-4 flex items-center gap-4">
    ${['projects', 'certificates', 'gallery'].includes(k) ? `<div class="thumb !h-14 !w-20 !text-xl rounded-lg shrink-0">${r.image_url ? `<img src="${esc(safeUrl(r.image_url))}" alt="">` : esc((r.title || '?').charAt(0))}</div>` : ''}
    <div class="flex-1 min-w-0"><b class="block truncate">${esc(c.label(r))}</b><span class="muted text-sm">${esc(c.sub(r))}</span></div>
    <button class="btn-ghost !py-2 !px-4" data-edit="${r.id}">Edit</button><button class="btn-ghost !py-2 !px-4 !text-red-400" data-del="${r.id}">Hapus</button></div>`).join('') : '<p class="muted">Belum ada data. Klik "+ Tambah".</p>'}</div>`;
  view.onclick = async e => {
    if (e.target.closest('[data-add]')) form(k, null);
    const ed = e.target.closest('[data-edit]'); if (ed) form(k, rows.find(r => r.id === ed.dataset.edit));
    const dl = e.target.closest('[data-del]');
    if (dl && confirm('Hapus data ini? Tindakan tidak bisa dibatalkan.')) { await q(sb.from(k).delete().eq('id', dl.dataset.del)); toast('Dihapus'); show(k); }
  };
}

function field(f, v) {
  const [n, l, t] = f, val = n === 'tech' ? (v || []).join(', ') : (v ?? '');
  const lab = `<label class="block text-sm muted mb-1">${l}</label>`;
  if (t === 'textarea') return `<div>${lab}<textarea name="${n}" rows="4" class="inp" required>${esc(val)}</textarea></div>`;
  if (t === 'file') return `<div>${lab}${val ? `<img src="${esc(safeUrl(val))}" class="h-24 rounded-lg mb-2" alt="">` : ''}<input type="file" name="${n}" accept="image/png,image/jpeg,image/webp,image/gif" class="inp"><small class="muted">Maks 5 MB. Kosongkan jika tidak ingin mengubah.</small></div>`;
  return `<div>${lab}<input name="${n}" type="${t || 'text'}" value="${esc(val)}" class="inp" ${['demo_url', 'repo_url', 'sort', 'caption'].includes(n) ? '' : 'required'} ${t === 'number' ? 'step="1"' : ''}></div>`;
}
function openForm(title, html, onSave) {
  $('#modalBody').innerHTML = `<h2 class="text-xl font-bold mb-4">${title}</h2><form class="space-y-4">${html}<div class="flex gap-3 justify-end pt-2"><button type="button" class="btn-ghost" id="cancel">Batal</button><button class="btn" type="submit">Simpan</button></div></form>`;
  const m = $('#modal'); m.classList.add('open');
  $('#cancel').onclick = () => m.classList.remove('open');
  $('#modalBody form').onsubmit = async e => {
    e.preventDefault(); const b = $('button[type=submit]', e.target); b.disabled = true; b.textContent = 'Menyimpan...';
    try { await onSave(e.target); m.classList.remove('open'); } catch (err) { toast(err.message || 'Gagal menyimpan', true); }
    b.disabled = false; b.textContent = 'Simpan';
  };
}
function form(k, row) {
  const c = ENT[k];
  openForm((row ? 'Edit ' : 'Tambah ') + c.title, c.fields.map(f => field(f, row?.[f[0]])).join(''), async f => {
    const d = {};
    for (const [n, , t] of c.fields) {
      if (t === 'file') {
        const file = f[n].files[0]; d[n] = row?.[n] || null;
        if (file) {
          if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran gambar maksimal 5 MB');
          const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
          const up = await sb.storage.from(CONFIG.BUCKET).upload(path, file, { contentType: file.type });
          if (up.error) throw up.error;
          d[n] = sb.storage.from(CONFIG.BUCKET).getPublicUrl(path).data.publicUrl;
        }
      } else if (n === 'tech') d[n] = f[n].value.split(',').map(s => s.trim()).filter(Boolean);
      else if (t === 'number') d[n] = Math.max(n === 'level' ? 0 : -1e6, Math.min(n === 'level' ? 100 : 1e6, parseInt(f[n].value || 0, 10) || 0));
      else d[n] = f[n].value.trim() || (n.endsWith('_url') ? null : '');
    }
    if (c.needImage && !d.image_url) throw new Error('Foto wajib diupload');
    await q(row ? sb.from(k).update(d).eq('id', row.id) : sb.from(k).insert(d));
    toast('Tersimpan'); show(k);
  });
}

async function msgs() {
  const rows = await q(sb.from('messages').select('*').order('created_at', { ascending: false }));
  view.innerHTML = `<h1 class="h2">Messages</h1><div class="grid gap-3 mt-6">${rows.length ? rows.map(m => `<div class="glass p-5 ${m.is_read ? 'opacity-70' : 'border-cyan-400'}">
   <div class="flex flex-wrap justify-between gap-2"><b>${esc(m.name)} ${m.is_read ? '' : '<span class="tag">baru</span>'}</b><span class="muted text-xs">${new Date(m.created_at).toLocaleString('id-ID')}</span></div>
   <a class="text-cyan-400 text-sm" href="mailto:${esc(m.email)}">${esc(m.email)}</a><p class="mt-3 whitespace-pre-wrap break-words">${esc(m.message)}</p>
   <div class="flex gap-3 mt-4">${m.is_read ? '' : `<button class="btn-ghost !py-2 !px-4" data-read="${m.id}">Tandai dibaca</button>`}<button class="btn-ghost !py-2 !px-4 !text-red-400" data-del="${m.id}">Hapus</button></div></div>`).join('') : '<p class="muted">Belum ada pesan masuk.</p>'}</div>`;
  view.onclick = async e => {
    const r = e.target.closest('[data-read]'), d = e.target.closest('[data-del]');
    if (r) { await q(sb.from('messages').update({ is_read: true }).eq('id', r.dataset.read)); show('messages'); }
    if (d && confirm('Hapus pesan ini?')) { await q(sb.from('messages').delete().eq('id', d.dataset.del)); toast('Pesan dihapus'); show('messages'); }
  };
}

async function prof() {
  const row = (await q(sb.from('profiles').select('*').limit(1)))[0];
  const F = [['full_name', 'Nama lengkap'], ['title', 'Judul / profesi'], ['email', 'Email'], ['bio', 'Bio singkat (hero)', 'textarea'], ['about', 'Tentang saya', 'textarea'], ['github', 'Link GitHub'], ['instagram', 'Link Instagram'], ['linkedin', 'Link LinkedIn'], ['whatsapp', 'Link WhatsApp (https://wa.me/62...)'], ['avatar_url', 'Foto profil', 'file'], ['cv_url', 'URL CV (kosongkan = assets/cv/cv.pdf)']];
  view.innerHTML = `<h1 class="h2">Profile</h1><form id="pf" class="glass p-6 mt-6 space-y-4 max-w-2xl">${F.map(f => field(f, row?.[f[0]]).replace(' required', f[0] === 'cv_url' ? '' : ' required')).join('')}<button class="btn" type="submit">Simpan profil</button></form>`;
  $('#pf').onsubmit = async e => {
    e.preventDefault(); const f = e.target, d = {}, b = $('button', f); b.disabled = true;
    try {
      for (const [n, , t] of F) {
        if (t === 'file') {
          const file = f[n].files[0]; d[n] = row?.[n] || null;
          if (file) {
            if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran gambar maksimal 5 MB');
            const path = `avatar-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
            const up = await sb.storage.from(CONFIG.BUCKET).upload(path, file, { contentType: file.type }); if (up.error) throw up.error;
            d[n] = sb.storage.from(CONFIG.BUCKET).getPublicUrl(path).data.publicUrl;
          }
        } else d[n] = f[n].value.trim() || null;
      }
      await q(row ? sb.from('profiles').update(d).eq('id', row.id) : sb.from('profiles').insert(d));
      toast('Profil tersimpan'); show('profile');
    } catch (err) { toast(err.message, true); }
    b.disabled = false;
  };
}
boot();
