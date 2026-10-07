/* Data demo dipakai jika Supabase belum dikonfigurasi / tabel kosong. Data asli diubah lewat admin.html. */
const DEMO = {
  profile: { full_name: '[NAMA SAYA]', title: 'Full-Stack Web Developer', email: '[EMAIL]',
    bio: 'Saya membangun website modern, cepat, dan aman, dari antarmuka hingga database.',
    about: 'Saya developer yang fokus pada web modern dengan HTML, Tailwind CSS, JavaScript, dan Supabase. Saya suka mengubah ide menjadi produk nyata: toko online, sistem informasi, sampai perangkat IoT yang terhubung ke web.',
    github: '[LINK GITHUB]', instagram: '[LINK INSTAGRAM]', linkedin: '[LINK LINKEDIN]', whatsapp: '[LINK WHATSAPP]', avatar_url: '', cv_url: '' },
  projects: [
    ['E-Commerce Website', 'web', 'Toko online lengkap dengan katalog, keranjang, dan checkout.', ['HTML', 'Tailwind', 'Supabase']],
    ['Class Website', 'web', 'Website kelas berisi jadwal, galeri kegiatan, dan pengumuman.', ['HTML', 'Tailwind', 'JavaScript']],
    ['Library Management System', 'app', 'Sistem perpustakaan untuk data buku, anggota, dan peminjaman.', ['JavaScript', 'PostgreSQL', 'Supabase']],
    ['Personal Portfolio', 'web', 'Portfolio pribadi bergaya futuristik dengan dashboard admin.', ['HTML', 'Tailwind', 'Supabase']],
    ['Roblox Account Store', 'web', 'Etalase penjualan akun Roblox dengan filter dan detail produk.', ['HTML', 'Tailwind', 'JavaScript']],
    ['Smart Security Gate', 'iot', 'Gerbang pintar berbasis ESP32 dengan log akses real-time di web.', ['ESP32', 'C++', 'Supabase']]
  ].map((p, i) => ({ id: 'd' + i, title: p[0], category: p[1], description: p[2], tech: p[3], image_url: '', demo_url: '', repo_url: '' })),
  skills: [['HTML5', 'frontend', 92], ['Tailwind CSS', 'frontend', 90], ['JavaScript', 'frontend', 85], ['Supabase', 'backend', 80], ['PostgreSQL', 'backend', 75], ['Auth & RLS', 'backend', 78], ['Git & GitHub', 'tools', 82], ['Vercel', 'tools', 80]]
    .map((s, i) => ({ id: 's' + i, name: s[0], category: s[1], level: s[2] })),
  experiences: [
    { id: 'e1', role: 'Freelance Web Developer', company: 'Self-employed', period: '2023 - Sekarang', description: 'Membangun website toko online, company profile, dan sistem informasi untuk klien.' },
    { id: 'e2', role: 'IoT & Web Project', company: 'Sekolah / Kampus', period: '2022 - 2023', description: 'Mengembangkan Smart Security Gate dengan dashboard monitoring berbasis web.' },
    { id: 'e3', role: 'Web Development Learner', company: 'Belajar Mandiri', period: '2021 - 2022', description: 'Mendalami HTML, CSS, JavaScript dan membuat puluhan project latihan.' }
  ]
};
DEMO.certificates = [['Belajar Dasar Pemrograman Web', 'Dicoding', '2023'], ['JavaScript Fundamentals', 'Online Course', '2023'], ['Juara Lomba Web Design', 'Sekolah / Kampus', '2022']]
  .map((c, i) => ({ id: 'c' + i, title: c[0], issuer: c[1], year: c[2], image_url: '' }));
DEMO.gallery = [['Workshop Web Development', 'Berbagi ilmu bersama teman-teman'], ['Lomba Coding', 'Mengikuti kompetisi tingkat sekolah'], ['Kerja Tim Project', 'Diskusi dan ngoding bareng'], ['Pameran Karya', 'Menampilkan project di acara sekolah'], ['Seminar Teknologi', 'Belajar dari praktisi industri'], ['Kegiatan Organisasi', 'Aktif berkontribusi di komunitas']]
  .map((g, i) => ({ id: 'g' + i, title: g[0], caption: g[1], image_url: '' }));
let DATA = DEMO;

async function loadData() {
  if (!sb) return;
  try {
    const [p, pr, s, e, c, g] = await Promise.all([
      sb.from('profiles').select('*').limit(1),
      sb.from('projects').select('*').order('created_at', { ascending: false }),
      sb.from('skills').select('*').order('level', { ascending: false }),
      sb.from('experiences').select('*').order('sort', { ascending: false }),
      sb.from('certificates').select('*').order('created_at', { ascending: false }),
      sb.from('gallery').select('*').order('created_at', { ascending: false })
    ]);
    DATA = {
      profile: p.data?.[0] || DEMO.profile,
      projects: pr.error ? DEMO.projects : pr.data,
      skills: s.error ? DEMO.skills : s.data,
      experiences: e.error ? DEMO.experiences : e.data,
      certificates: c.error ? DEMO.certificates : c.data,
      gallery: g.error ? DEMO.gallery : g.data
    };
  } catch (err) { console.warn('Supabase gagal, memakai data demo', err); }
}

function renderProfile() {
  const p = DATA.profile, name = p.full_name || '[NAMA SAYA]';
  document.title = 'Portfolio | ' + name;
  $('#pName').textContent = name; $('#codeName').textContent = '"' + name + '"'; $('#fName').textContent = name;
  $('#pTitle').textContent = p.title || ''; $('#pBio').textContent = p.bio || ''; $('#pAbout').textContent = p.about || '';
  $('#cEmail').textContent = p.email || ''; $('#cEmail').href = 'mailto:' + (p.email || '');
  $('#cvBtn').href = safeUrl(p.cv_url || CONFIG.CV_URL);
  if (p.avatar_url) { const a = $('#avatar'); a.src = safeUrl(p.avatar_url); a.classList.remove('hidden'); $('#avatarTxt').classList.add('hidden'); }
  else $('#avatarTxt').textContent = name.replace('[', '').charAt(0).toUpperCase() || 'N';
  const L = [['GH', p.github, 'GitHub'], ['IG', p.instagram, 'Instagram'], ['IN', p.linkedin, 'LinkedIn'], ['WA', p.whatsapp, 'WhatsApp']];
  $$('.social').forEach(b => b.innerHTML = L.map(l => `<a href="${esc(safeUrl(l[1]))}" target="_blank" rel="noopener noreferrer" aria-label="${l[2]}" title="${l[2]}">${l[0]}</a>`).join(''));
  $('#stats').innerHTML = [[DATA.projects.length, 'Projects'], [DATA.skills.length, 'Skills'], [DATA.experiences.length, 'Pengalaman']]
    .map(s => `<div class="glass p-4 text-center"><div class="text-2xl font-extrabold grad-text">${s[0]}</div><div class="muted text-xs">${s[1]}</div></div>`).join('');
}

function filters(box, items, key, onPick) {
  const cats = ['all', ...new Set(items.map(i => (i[key] || 'other').toLowerCase()))];
  box.innerHTML = cats.map((c, i) => `<button class="fbtn ${i ? '' : 'active'}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
  box.onclick = e => { const b = e.target.closest('.fbtn'); if (!b) return; $$('.fbtn', box).forEach(x => x.classList.remove('active')); b.classList.add('active'); onPick(b.dataset.c); };
}

function renderSkills(cat = 'all') {
  const list = DATA.skills.filter(s => cat === 'all' || (s.category || 'other').toLowerCase() === cat);
  $('#skillGrid').innerHTML = list.map(s => `<div class="glass card p-5"><div class="flex justify-between mb-3"><b>${esc(s.name)}</b><span class="mono text-cyan-400 text-sm">${esc(s.level)}%</span></div><div class="bar"><i data-w="${Math.min(100, +s.level || 0)}"></i></div><span class="tag mt-3 inline-block">${esc(s.category)}</span></div>`).join('');
  requestAnimationFrame(() => $$('#skillGrid .bar i').forEach(i => i.style.width = i.dataset.w + '%'));
}

function renderProjects(cat = 'all') {
  const list = DATA.projects.filter(p => cat === 'all' || (p.category || 'other').toLowerCase() === cat);
  $('#projectGrid').innerHTML = list.map(p => `<article class="glass card overflow-hidden cursor-pointer reveal" data-id="${esc(p.id)}" tabindex="0" role="button" aria-label="Detail ${esc(p.title)}">
    <div class="thumb">${p.image_url ? `<img src="${esc(safeUrl(p.image_url))}" alt="${esc(p.title)}" loading="lazy">` : esc((p.title || '?').charAt(0))}</div>
    <div class="p-5"><h3 class="font-semibold">${esc(p.title)}</h3><p class="muted text-sm mt-2">${esc(p.description)}</p>
    <div class="flex flex-wrap gap-2 mt-4">${(p.tech || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div></div></article>`).join('');
  observe();
}

function openModal(id) {
  const p = DATA.projects.find(x => String(x.id) === String(id)); if (!p) return;
  const btn = (u, t, c) => u ? `<a class="${c}" href="${esc(safeUrl(u))}" target="_blank" rel="noopener noreferrer">${t}</a>` : '';
  $('#modalBody').innerHTML = `<button id="closeModal" class="icon-btn absolute top-3 right-3 bg-black/40 z-10" aria-label="Tutup">✕</button>
    <div class="thumb" style="height:240px">${p.image_url ? `<img src="${esc(safeUrl(p.image_url))}" alt="${esc(p.title)}">` : esc((p.title || '?').charAt(0))}</div>
    <div class="p-6"><span class="tag">${esc(p.category)}</span><h3 class="text-2xl font-bold mt-3">${esc(p.title)}</h3>
    <p class="muted mt-3 leading-7">${esc(p.description)}</p>
    <div class="flex flex-wrap gap-2 mt-4">${(p.tech || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    <div class="flex flex-wrap gap-3 mt-6">${btn(p.demo_url, 'Live Demo', 'btn')}${btn(p.repo_url, 'Source Code', 'btn-ghost')}</div></div>`;
  $('#modal').classList.add('open'); document.body.style.overflow = 'hidden'; $('#closeModal').focus();
}
const closeModal = () => { $('#modal').classList.remove('open'); document.body.style.overflow = ''; };

function renderCerts() {
  $('#certGrid').innerHTML = DATA.certificates.map(c => `<article class="glass card overflow-hidden cursor-pointer reveal" data-cert="${esc(c.id)}" tabindex="0" role="button" aria-label="Lihat ${esc(c.title)}">
    <div class="thumb">${c.image_url ? `<img src="${esc(safeUrl(c.image_url))}" alt="${esc(c.title)}" loading="lazy">` : '🏅'}</div>
    <div class="p-5"><h3 class="font-semibold">${esc(c.title)}</h3><p class="muted text-sm mt-1">${esc(c.issuer)} ${c.year ? '· ' + esc(c.year) : ''}</p></div></article>`).join('');
  observe();
}
function openCert(id) {
  const c = DATA.certificates.find(x => String(x.id) === String(id)); if (!c) return;
  $('#modalBody').innerHTML = `<button id="closeModal" class="icon-btn absolute top-3 right-3 bg-black/40 z-10" aria-label="Tutup">✕</button>
    ${c.image_url ? `<img src="${esc(safeUrl(c.image_url))}" alt="${esc(c.title)}" class="w-full">` : '<div class="thumb" style="height:240px">🏅</div>'}
    <div class="p-6"><h3 class="text-xl font-bold">${esc(c.title)}</h3><p class="muted mt-2">${esc(c.issuer)} ${c.year ? '· ' + esc(c.year) : ''}</p></div>`;
  $('#modal').classList.add('open'); document.body.style.overflow = 'hidden'; $('#closeModal').focus();
}

function renderGallery() {
  $('#galleryGrid').innerHTML = DATA.gallery.map(g => `<figure class="glass card overflow-hidden cursor-pointer reveal group" data-gal="${esc(g.id)}" tabindex="0" role="button" aria-label="Lihat foto ${esc(g.title)}">
    <div class="thumb" style="height:210px">${g.image_url ? `<img src="${esc(safeUrl(g.image_url))}" alt="${esc(g.title)}" loading="lazy">` : '📸'}</div>
    <figcaption class="p-3 text-sm font-semibold truncate">${esc(g.title)}</figcaption></figure>`).join('');
  observe();
}
function openGallery(id) {
  const g = DATA.gallery.find(x => String(x.id) === String(id)); if (!g) return;
  $('#modalBody').innerHTML = `<button id="closeModal" class="icon-btn absolute top-3 right-3 bg-black/40 z-10" aria-label="Tutup">✕</button>
    ${g.image_url ? `<img src="${esc(safeUrl(g.image_url))}" alt="${esc(g.title)}" class="w-full">` : '<div class="thumb" style="height:240px">📸</div>'}
    <div class="p-6"><h3 class="text-xl font-bold">${esc(g.title)}</h3><p class="muted mt-2">${esc(g.caption)}</p></div>`;
  $('#modal').classList.add('open'); document.body.style.overflow = 'hidden'; $('#closeModal').focus();
}

function renderExp() {
  $('#expList').innerHTML = DATA.experiences.map(e => `<div class="glass card p-6 reveal"><div class="flex flex-wrap justify-between gap-2"><h3 class="font-semibold">${esc(e.role)}</h3><span class="mono text-cyan-400 text-sm">${esc(e.period)}</span></div><p class="text-sm grad-text font-semibold mt-1">${esc(e.company)}</p><p class="muted text-sm mt-3 leading-7">${esc(e.description)}</p></div>`).join('');
}

let io;
function observe() {
  if (!io) io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
  $$('.reveal:not(.in)').forEach(el => io.observe(el));
}

function bindUI() {
  $('#year').textContent = new Date().getFullYear();
  const menu = $('#mobileMenu'), mb = $('#menuBtn');
  const setMenu = o => { menu.classList.toggle('open', o); mb.setAttribute('aria-expanded', o); mb.textContent = o ? '✕' : '☰'; };
  mb.onclick = () => setMenu(!menu.classList.contains('open'));
  $$('a', menu).forEach(a => a.onclick = () => setMenu(false));
  $('#themeBtn').onclick = () => { const l = document.documentElement.classList.toggle('light'); try { localStorage.theme = l ? 'light' : 'dark'; } catch (e) { } };
  $('#projectGrid').onclick = e => { const c = e.target.closest('[data-id]'); if (c) openModal(c.dataset.id); };
  $('#projectGrid').onkeydown = e => { if (e.key === 'Enter') { const c = e.target.closest('[data-id]'); if (c) openModal(c.dataset.id); } };
  $('#certGrid').onclick = e => { const c = e.target.closest('[data-cert]'); if (c) openCert(c.dataset.cert); };
  $('#certGrid').onkeydown = e => { if (e.key === 'Enter') { const c = e.target.closest('[data-cert]'); if (c) openCert(c.dataset.cert); } };
  $('#galleryGrid').onclick = e => { const c = e.target.closest('[data-gal]'); if (c) openGallery(c.dataset.gal); };
  $('#galleryGrid').onkeydown = e => { if (e.key === 'Enter') { const c = e.target.closest('[data-gal]'); if (c) openGallery(c.dataset.gal); } };
  $('#modal').onclick = e => { if (e.target.id === 'modal' || e.target.closest('#closeModal')) closeModal(); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  const links = $$('.nl'), secs = links.map(l => $(l.getAttribute('href')));
  addEventListener('scroll', () => { const y = scrollY + 140; secs.forEach((s, i) => links[i].classList.toggle('active', s.offsetTop <= y && s.offsetTop + s.offsetHeight > y)); }, { passive: true });
  $('#contactForm').onsubmit = async e => {
    e.preventDefault(); const f = e.target, b = $('#sendBtn');
    const row = { name: f.name.value.trim(), email: f.email.value.trim(), message: f.message.value.trim() };
    if (!row.name || !/^\S+@\S+\.\S+$/.test(row.email) || row.message.length < 5) return toast('Lengkapi nama, email valid, dan pesan (min. 5 karakter).', true);
    if (!sb) return toast('Supabase belum dikonfigurasi. Isi js/supabase.js terlebih dahulu.', true);
    b.disabled = true; b.textContent = 'Mengirim...';
    const { error } = await sb.from('messages').insert(row);
    b.disabled = false; b.textContent = 'Kirim Pesan';
    if (error) return toast('Gagal mengirim pesan: ' + error.message, true);
    f.reset(); toast('Pesan terkirim. Terima kasih!');
  };
}

(async function init() {
  bindUI(); await loadData(); renderProfile();
  filters($('#skillFilters'), DATA.skills, 'category', renderSkills); renderSkills();
  filters($('#projectFilters'), DATA.projects, 'category', renderProjects); renderProjects();
  renderExp(); renderCerts(); renderGallery(); observe();
  // Sembunyikan section (dan link navbar-nya) jika datanya kosong
  const ids = { projects: 'projects', skills: 'skills', experiences: 'experience', certificates: 'certificates', gallery: 'gallery' };
  Object.keys(ids).forEach(k => { if (!DATA[k].length) { $('#' + ids[k]).classList.add('hidden'); $$('a[href="#' + ids[k] + '"]').forEach(a => a.classList.add('hidden')); } });
})();
