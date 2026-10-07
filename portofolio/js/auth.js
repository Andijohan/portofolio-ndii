/* Autentikasi admin memakai Supabase Auth (tanpa sistem password buatan sendiri). */
const Auth = {
  async session() { const { data } = await sb.auth.getSession(); return data.session; },
  async login(email, password) { const { error } = await sb.auth.signInWithPassword({ email, password }); if (error) throw error; },
  async logout() { await sb.auth.signOut(); },
  // Admin = user yang ada di tabel public.admins (juga ditegakkan oleh RLS di database).
  async isAdmin() {
    const s = await this.session(); if (!s) return false;
    const { data, error } = await sb.from('admins').select('user_id').eq('user_id', s.user.id).maybeSingle();
    return !error && !!data;
  }
};
