/** Turn a YouTube link into an embeddable URL, or detect a direct video file. */
export function embed(url: string): { kind: 'yt' | 'file'; src: string } | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: 'yt', src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1` };
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return { kind: 'file', src: url };
  return null;
}
export const initials = (n: string): string => n.split(' ').map((w) => w.charAt(0)).join('').slice(0, 2).toUpperCase();
export const fmtDate = (d: string): string => (d ? new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
/** Supabase errors are plain objects, not Error instances. */
export const errMsg = (x: unknown): string =>
  x && typeof x === 'object' && 'message' in x ? String((x as { message: unknown }).message) : 'Something went wrong. Please try again.';
