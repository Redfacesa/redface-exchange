// All communication with Supabase lives here.
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const configured = !!(url && key && !url.includes('YOUR-') && !key.includes('YOUR-'));
const sb: SupabaseClient | null = configured ? createClient(url as string, key as string) : null;
const db = (): SupabaseClient => {
  if (!sb) throw new Error('Supabase is not set up yet. Copy .env.example to .env and add your URL and key.');
  return sb;
};

type Dict = Record<string, any>;
export type Row = Dict & { id?: string };
export type SectionKey = 'applications' | 'episodes' | 'guests' | 'articles' | 'contributions' | 'enquiries' | 'sponsors' | 'media';
export interface HomeContent { headline: string; intro: string; cta: string }
export const DEFAULT_HOME: HomeContent = {
  headline: 'Where Business Leaders Share Their Stories.',
  intro: 'Long-form conversations with CEOs, founders, entrepreneurs and investors about the journeys, setbacks and lessons behind their businesses.',
  cta: 'Watch Episodes'
};
export interface Episode { id: string; num: number | null; title: string; guest: string; topic: string; url: string; desc: string }
export interface Article { id: string; category: string; title: string; author: string; date: string; body: string }
export interface Guest { id: string; name: string; role: string; company: string; photo: string }
export interface Sponsor { id: string; name: string; url: string; logo: string }
export interface VideoItem { id: string; title: string; guest: string; url: string; path: string; size: number | null }
export interface GuestApplication {
  full_name: string; company_name: string; email: string; job_title: string; phone: string; website: string;
  industry: string; linkedin_url: string; biography: string; reason: string; topics: string; company_description?: string;
}

const fail = (r: { data: any; error: any }): any => { if (r.error) throw r.error; return r.data; };
const blank = (v: any): any => (v === '' || v === undefined || v === null ? null : typeof v === 'string' ? v.trim() || null : v);
const safeName = (n: string): string => n.replace(/[^a-zA-Z0-9._-]/g, '_');
const cap = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const orEmpty = <T,>(r: { data: any; error: any }, f: (d: Dict) => T): T[] => (r.error || !r.data ? [] : (r.data as Dict[]).map(f));

// ---------- dashboard section -> table mapping ----------
interface SectionMap { t: string; f: [string, string][]; st?: boolean; kind?: boolean; d?: string; dw?: boolean }
const M: Record<SectionKey, SectionMap> = {
  applications:  { t: 'guest_applications',    st: true, d: 'created_at', f: [['name','full_name'],['company','company_name'],['title','job_title'],['email','email'],['industry','industry'],['bio','biography'],['why','reason'],['rec','recording_date'],['notes','internal_notes']] },
  episodes:      { t: 'episodes',              st: true, d: 'publish_date', dw: true, f: [['num','episode_number'],['title','title'],['guest','guest_name'],['topic','topic'],['url','video_url'],['audio','audio_url'],['desc','description']] },
  guests:        { t: 'guests',                f: [['name','name'],['role','job_title'],['company','company'],['photo','photo_url'],['link','linkedin_url'],['bio','biography']] },
  articles:      { t: 'articles',              st: true, d: 'publish_date', dw: true, f: [['title','title'],['category','category'],['author','author_name'],['img','featured_image_url'],['body','body']] },
  contributions: { t: 'contributions',         st: true, d: 'created_at', f: [['name','contributor_name'],['email','contributor_email'],['category','category'],['amount','amount']] },
  enquiries:     { t: 'sponsorship_enquiries', st: true, d: 'created_at', f: [['company','company_name'],['contact','contact_name'],['email','email'],['type','partnership_type'],['budget','budget_range'],['msg','message']] },
  sponsors:      { t: 'sponsors',              kind: true, f: [['name','name'],['url','website_url'],['logo','logo_url']] },
  media:         { t: 'media_assets',          f: [['file','file_name'],['type','file_type']] }
};
const KEYS = Object.keys(M) as SectionKey[];

function fromRow(k: SectionKey, row: Dict): Row {
  const m = M[k], r: Row = { id: row.id };
  m.f.forEach(([dk, col]) => { r[dk] = row[col] == null ? '' : row[col]; });
  if (m.st) r.status = row.status;
  if (m.kind) r.status = row.kind;
  if (m.d) r.date = String(row[m.d] || '').slice(0, 10);
  return r;
}
function toRow(k: SectionKey, r: Row): Dict {
  const m = M[k], o: Dict = {};
  m.f.forEach(([dk, col]) => { o[col] = blank(r[dk]); });
  if (k === 'episodes') o.episode_number = o.episode_number == null ? null : parseInt(o.episode_number, 10);
  if (m.st) o.status = r.status;
  if (m.kind) o.kind = r.status;
  if (m.dw && m.d) o[m.d] = blank(r.date);
  return o;
}

// ---------- admin ----------
export const admin = {
  async signIn(email: string, password: string): Promise<string | null> {
    const d = fail(await db().auth.signInWithPassword({ email, password }));
    const p = fail(await db().from('profiles').select('role').eq('id', d.user.id).single());
    return p.role === 'none' ? null : cap(p.role);
  },
  async signOut(): Promise<void> { if (sb) await sb.auth.signOut(); },
  async loadAll(): Promise<{ data: Record<string, Row[]>; home: HomeContent }> {
    const data: Record<string, Row[]> = {};
    await Promise.all(KEYS.map(async (k) => {
      const r = await db().from(M[k].t).select('*').order('created_at', { ascending: false });
      data[k] = r.error ? [] : (r.data as Dict[]).map((x) => fromRow(k, x));
    }));
    return { data, home: await getHome() };
  },
  async save(k: SectionKey, r: Row, isNew: boolean): Promise<Row> {
    const t = db().from(M[k].t);
    const q = isNew ? t.insert(toRow(k, r)) : t.update(toRow(k, r)).eq('id', r.id as string);
    return fromRow(k, fail(await q.select().single()));
  },
  async remove(k: SectionKey, id: string): Promise<void> { fail(await db().from(M[k].t).delete().eq('id', id)); },
  async saveHome(h: HomeContent): Promise<void> { fail(await db().from('site_content').upsert({ key: 'home', value: h })); },
  async listVideos(): Promise<VideoItem[]> { return listVideos(); },
  async uploadVideo(file: File, title: string, guest: string): Promise<void> {
    const path = `${Date.now()}-${safeName(file.name)}`;
    fail(await db().storage.from('videos').upload(path, file, { contentType: file.type }));
    const publicUrl = db().storage.from('videos').getPublicUrl(path).data.publicUrl;
    fail(await db().from('videos').insert({ title, guest_name: blank(guest), storage_path: path, video_url: publicUrl, size_bytes: file.size }));
  },
  async removeVideo(v: VideoItem): Promise<void> {
    await db().storage.from('videos').remove([v.path]);
    fail(await db().from('videos').delete().eq('id', v.id));
  }
};

// ---------- public website: read ----------
export async function listVideos(): Promise<VideoItem[]> {
  if (!sb) return [];
  const r = await sb.from('videos').select('*').order('created_at', { ascending: false });
  return orEmpty(r, (v) => ({ id: v.id, title: v.title, guest: v.guest_name || '', url: v.video_url, path: v.storage_path, size: v.size_bytes }));
}
export async function listEpisodes(): Promise<Episode[]> {
  if (!sb) return [];
  const r = await sb.from('episodes').select('*').eq('status', 'Published').order('episode_number', { ascending: false });
  return orEmpty(r, (e) => ({ id: e.id, num: e.episode_number, title: e.title, guest: e.guest_name || '', topic: e.topic || 'Episode', url: e.video_url || '', desc: e.description || '' }));
}
export async function listArticles(): Promise<Article[]> {
  if (!sb) return [];
  const r = await sb.from('articles').select('*').eq('status', 'Published').order('publish_date', { ascending: false });
  return orEmpty(r, (a) => ({ id: a.id, category: a.category || 'News', title: a.title, author: a.author_name || '', date: a.publish_date || '', body: a.body || '' }));
}
export async function listGuests(): Promise<Guest[]> {
  if (!sb) return [];
  const r = await sb.from('guests').select('*').order('created_at', { ascending: false }).limit(8);
  return orEmpty(r, (g) => ({ id: g.id, name: g.name, role: g.job_title || '', company: g.company || '', photo: g.photo_url || '' }));
}
export async function listSponsors(): Promise<Sponsor[]> {
  if (!sb) return [];
  const r = await sb.from('sponsors').select('*').order('display_order');
  return orEmpty(r, (s) => ({ id: s.id, name: s.name, url: s.website_url || '', logo: s.logo_url || '' }));
}
export async function getHome(): Promise<HomeContent> {
  if (!sb) return DEFAULT_HOME;
  const r = await sb.from('site_content').select('value').eq('key', 'home').maybeSingle();
  return { ...DEFAULT_HOME, ...((r.data as Dict | null)?.value || {}) };
}

// ---------- public website: forms (insert only) ----------
export async function submitGuest(v: GuestApplication, photo?: File): Promise<void> {
  let photo_path: string | null = null;
  if (photo && photo.size > 0) {
    photo_path = fail(await db().storage.from('applications').upload(`apply-${Date.now()}-${safeName(photo.name)}`, photo)).path;
  }
  const o: Dict = {};
  (Object.keys(v) as (keyof GuestApplication)[]).forEach((k) => { o[k] = blank(v[k]); });
  fail(await db().from('guest_applications').insert({ ...o, photo_path }));
}
export async function submitEnquiry(v: { company_name: string; contact_name: string; email: string; partnership_type: string; budget_range: string; message: string }): Promise<void> {
  const o: Dict = {};
  (Object.keys(v) as (keyof typeof v)[]).forEach((k) => { o[k] = blank(v[k]); });
  fail(await db().from('sponsorship_enquiries').insert(o));
}
export async function addContribution(c: { name: string; email: string; category: string; amount: number }): Promise<void> {
  fail(await db().from('contributions').insert({ contributor_name: blank(c.name), contributor_email: blank(c.email), category: c.category, amount: c.amount }));
}
export async function submitContact(c: { name: string; email: string; topic: string; message: string }): Promise<void> {
  fail(await db().from('contact_messages').insert({ name: blank(c.name), email: c.email.trim(), topic: blank(c.topic), message: c.message }));
}
