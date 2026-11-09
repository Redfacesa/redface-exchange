import { FormEvent, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { admin, DEFAULT_HOME } from '../lib/api';
import type { HomeContent, Row, SectionKey, VideoItem } from '../lib/api';
import { ACCESS, NAMES, ORDER, SECS } from '../lib/sections';
import { errMsg } from '../lib/util';

const GOOD = ['Approved', 'Published', 'Paid', 'Agreed', 'Scheduled', 'Sponsor'];
const WARN = ['New', 'Pending', 'Under review', 'Draft', 'In discussion', 'Contacted'];
const Pill = ({ s }: { s: string }) => <span className={'p ' + (GOOD.includes(s) ? 'g' : WARN.includes(s) ? 'w' : '')}>{s}</span>;
const SAMPLE_VISITS: [string, number][] = [['Mon', 38], ['Tue', 52], ['Wed', 47], ['Thu', 71], ['Fri', 66], ['Sat', 34], ['Sun', 29]];

export default function Admin() {
  const nav = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState('');
  const [err, setErr] = useState('');
  const [cur, setCur] = useState('overview');
  const [data, setData] = useState<Record<string, Row[]>>({});
  const [home, setHome] = useState<HomeContent>(DEFAULT_HOME);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [edit, setEdit] = useState<{ k: SectionKey; row: Row; isNew: boolean } | null>(null);
  const [toast, setToast] = useState('');
  const say = (m: string) => { setToast(m); window.setTimeout(() => setToast(''), 2600); };

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setErr('Signing in...');
    try {
      const r = await admin.signIn(String(f.get('email')), String(f.get('password')));
      if (!r) { setErr('This account has no admin role yet. Ask an admin to assign one.'); await admin.signOut(); return; }
      const all = await admin.loadAll();
      setData(all.data); setHome(all.home); setVideos(await admin.listVideos());
      setRole(r); setErr(''); setAuthed(true);
    } catch (x) { setErr(errMsg(x)); }
  }
  async function logout() { await admin.signOut(); setAuthed(false); nav('/'); }

  const mark = <img className="mark" src="/logo.png" alt="Red Face logo" width={52} height={48} />;

  if (!authed) {
    return (
      <div id="adm"><div className="gate"><div className="box">
        <h1>Admin login</h1><p />
        <form onSubmit={login}>
          <label className="fl">Email<input name="email" type="email" required autoComplete="username" /></label>
          <label className="fl">Password<input name="password" type="password" required autoComplete="current-password" /></label>
          <button className="bt" type="submit">Sign in</button>
        </form>
        <p className="note" role="alert">{err}</p>
        <Link className="note" to="/">Back to the website</Link>
      </div></div></div>
    );
  }

  const allowed = ACCESS[role] || ['overview'];
  const key = allowed.includes(cur) ? cur : 'overview';
  const count = (k: string, s: string) => (data[k] || []).filter((r) => r.status === s).length;

  const onSaved = (k: SectionKey, saved: Row, isNew: boolean) =>
    setData((d) => ({ ...d, [k]: isNew ? [saved, ...(d[k] || [])] : (d[k] || []).map((r) => (r.id === saved.id ? saved : r)) }));
  const onDeleted = (k: SectionKey, id: string) => setData((d) => ({ ...d, [k]: (d[k] || []).filter((r) => r.id !== id) }));

  return (
    <div id="adm">
      <aside className="sb">
        <div className="lg"><i />Exchange admin</div>
        <div id="anav" role="navigation" aria-label="Sections">
          {ORDER.filter((k) => allowed.includes(k)).map((k) => {
            const n = k === 'applications' ? count(k, 'New') : k === 'enquiries' ? count(k, 'New') : 0;
            return <button key={k} aria-current={k === key ? 'page' : undefined} onClick={() => { setCur(k); setEdit(null); }}>{NAMES[k]}{n > 0 && <em>{n}</em>}</button>;
          })}
        </div>
      </aside>
      <div className="mn">
        <div className="top"><span>Signed in as {role}</span><button className="bt o" onClick={logout}>Log out</button><Link className="bt o" to="/">View website</Link></div>
        {key === 'overview' && <Overview data={data} count={count} onOpen={(row) => { setCur('applications'); setEdit({ k: 'applications', row, isNew: false }); }} />}
        {key === 'home' && <HomeForm home={home} onSaved={(h) => { setHome(h); say('Homepage saved'); }} fail={(m) => say(m)} />}
        {key === 'videos' && <Videos videos={videos} reload={async () => setVideos(await admin.listVideos())} say={say} />}
        {key in SECS && <Table k={key as SectionKey} rows={data[key] || []} onOpen={(row) => setEdit({ k: key as SectionKey, row, isNew: false })} onNew={() => setEdit({ k: key as SectionKey, row: { status: SECS[key as SectionKey].st?.[0] }, isNew: true })} />}
        {mark}
      </div>
      <aside id="pn" className={edit ? 'on' : ''} aria-label="Edit record">
        {edit && <Panel key={edit.row.id || 'new'} {...edit} onClose={() => setEdit(null)} onSaved={onSaved} onDeleted={onDeleted} say={say} />}
      </aside>
      <div id="toast" role="status" style={{ display: toast ? 'block' : 'none' }}>{toast}</div>
    </div>
  );
}

function Overview({ data, count, onOpen }: { data: Record<string, Row[]>; count: (k: string, s: string) => number; onOpen: (r: Row) => void }) {
  const paid = (data.contributions || []).filter((r) => r.status === 'Paid').reduce((a, r) => a + Number(r.amount || 0), 0);
  return (
    <>
      <div className="bar"><h1>Overview</h1></div>
      <div className="stats">
        <div className="stat"><b>{count('applications', 'New')}</b><span>New guest applications</span></div>
        <div className="stat"><b>{count('enquiries', 'New')}</b><span>New sponsorship enquiries</span></div>
        <div className="stat"><b>{count('episodes', 'Published')}</b><span>Published episodes</span></div>
        <div className="stat"><b>{paid.toLocaleString('en-ZA')}</b><span>Contributions received</span></div>
      </div>
      <div className="two">
        <div className="card pad"><h2>Visitors this week</h2>
          <div className="chart">{SAMPLE_VISITS.map(([d, v]) => <div key={d} style={{ height: v * 2 }}><small>{d}</small></div>)}</div>
          <p className="note">Sample data. Connect an analytics service for live figures.</p></div>
        <div className="card pad"><h2>Latest applications</h2>
          <table><tbody>{(data.applications || []).slice(0, 3).map((r) => <tr key={r.id} onClick={() => onOpen(r)}><td>{r.name}</td><td>{r.company}</td><td><Pill s={r.status} /></td></tr>)}
            {!(data.applications || []).length && <tr><td>No applications yet.</td></tr>}</tbody></table></div>
      </div>
    </>
  );
}

function Table({ k, rows, onOpen, onNew }: { k: SectionKey; rows: Row[]; onOpen: (r: Row) => void; onNew: () => void }) {
  const sec = SECS[k];
  const label = (c: string) => (c === 'status' ? 'Status' : sec.fields.find((f) => f.key === c)?.label.split(' (')[0] || c);
  return (
    <>
      <div className="bar"><h1>{NAMES[k]}</h1>{!sec.ro && <button className="bt" onClick={onNew}>New</button>}</div>
      <div className="card"><table>
        <thead><tr>{sec.cols.map((c) => <th key={c}>{label(c)}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => <tr key={r.id} onClick={() => onOpen(r)}>{sec.cols.map((c) => <td key={c}>{c === 'status' ? <Pill s={r.status} /> : String(r[c] ?? '')}</td>)}</tr>)}
          {!rows.length && <tr><td colSpan={sec.cols.length}>Nothing here yet.</td></tr>}
        </tbody>
      </table></div>
    </>
  );
}

function Panel({ k, row, isNew, onClose, onSaved, onDeleted, say }: {
  k: SectionKey; row: Row; isNew: boolean; onClose: () => void;
  onSaved: (k: SectionKey, r: Row, isNew: boolean) => void; onDeleted: (k: SectionKey, id: string) => void; say: (m: string) => void;
}) {
  const sec = SECS[k];
  const [d, setD] = useState<Row>({ ...row });
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (key: string, v: string) => setD((x) => ({ ...x, [key]: v }));
  const save = () => {
    setBusy(true);
    admin.save(k, d, isNew).then((s) => { onSaved(k, s, isNew); onClose(); say('Saved'); }, (e) => { setBusy(false); say('Could not save: ' + errMsg(e)); });
  };
  const del = () => {
    if (!confirm) { setConfirm(true); return; }
    admin.remove(k, d.id as string).then(() => { onDeleted(k, d.id as string); onClose(); say('Deleted'); }, (e) => say('Could not delete: ' + errMsg(e)));
  };
  return (
    <>
      <h2 style={{ margin: '0 0 16px' }}>{isNew ? 'New record' : 'Edit record'}</h2>
      {sec.fields.map((f) => (
        <label key={f.key}>{f.label}
          {f.type === 'area'
            ? <textarea value={d[f.key] ?? ''} disabled={sec.ro} onChange={(e) => set(f.key, e.target.value)} />
            : <input type={f.type === 'date' ? 'date' : 'text'} value={d[f.key] ?? ''} disabled={sec.ro || (k !== 'applications' && f.key === 'date' && ['contributions', 'enquiries'].includes(k))} onChange={(e) => set(f.key, e.target.value)} />}
        </label>
      ))}
      {sec.st && <label>Status<select value={d.status ?? sec.st[0]} disabled={sec.ro} onChange={(e) => set('status', e.target.value)}>{sec.st.map((s) => <option key={s}>{s}</option>)}</select></label>}
      <div className="row">
        {!sec.ro && <button className="bt" onClick={save} disabled={busy}>Save</button>}
        {k === 'applications' && d.email && <a className="bt o" href={'mailto:' + d.email}>Email applicant</a>}
        {!isNew && !sec.ro && <button className="bt o" onClick={del}>{confirm ? 'Click again to delete' : 'Delete'}</button>}
        <button className="bt o" onClick={onClose}>Close</button>
      </div>
    </>
  );
}

function HomeForm({ home, onSaved, fail }: { home: HomeContent; onSaved: (h: HomeContent) => void; fail: (m: string) => void }) {
  const [h, setH] = useState(home);
  return (
    <>
      <div className="bar"><h1>Homepage content</h1></div>
      <div className="card pad" style={{ maxWidth: 640 }}>
        <label className="fl">Hero headline<input value={h.headline} onChange={(e) => setH({ ...h, headline: e.target.value })} /></label>
        <label className="fl">Introduction<textarea value={h.intro} onChange={(e) => setH({ ...h, intro: e.target.value })} /></label>
        <label className="fl">Main button label<input value={h.cta} onChange={(e) => setH({ ...h, cta: e.target.value })} /></label>
        <button className="bt" onClick={() => admin.saveHome(h).then(() => onSaved(h), (e) => fail('Could not save: ' + errMsg(e)))}>Save homepage</button>
      </div>
    </>
  );
}

function Videos({ videos, reload, say }: { videos: VideoItem[]; reload: () => Promise<void>; say: (m: string) => void }) {
  const file = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [guest, setGuest] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  async function upload() {
    const f = file.current?.files?.[0];
    if (!title.trim() || !f) { setMsg('Add a title and choose a video file.'); return; }
    if (f.size > 50 * 1048576) { setMsg('That file is over the 50 MB limit.'); return; }
    setBusy(true); setMsg('Uploading...');
    try { await admin.uploadVideo(f, title.trim(), guest.trim()); setTitle(''); setGuest(''); if (file.current) file.current.value = ''; setMsg(''); say('Video is now on the website'); await reload(); }
    catch (e) { setMsg('Upload failed: ' + errMsg(e)); }
    setBusy(false);
  }
  async function remove(v: VideoItem) {
    if (confirm !== v.id) { setConfirm(v.id); return; }
    try { await admin.removeVideo(v); say('Video removed'); await reload(); } catch (e) { say('Could not remove: ' + errMsg(e)); }
    setConfirm(null);
  }
  return (
    <>
      <div className="bar"><h1>Videos</h1></div>
      <div className="card pad" style={{ maxWidth: 640, marginBottom: 14 }}>
        <label className="fl">Title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="fl">Guest<input value={guest} onChange={(e) => setGuest(e.target.value)} /></label>
        <label className="fl">Video file (MP4 or WebM, up to 50 MB)<input ref={file} type="file" accept="video/*" /></label>
        <button className="bt" onClick={upload} disabled={busy}>Upload and show on website</button>
        <p className="note">{msg}</p>
      </div>
      <div className="card"><table>
        <thead><tr><th>Title</th><th>Guest</th><th>Size</th><th /></tr></thead>
        <tbody>
          {videos.map((v) => <tr key={v.id}><td>{v.title}</td><td>{v.guest}</td><td>{v.size ? (v.size / 1048576).toFixed(1) + ' MB' : ''}</td><td><button className="bt o" onClick={() => remove(v)}>{confirm === v.id ? 'Click again to remove' : 'Remove'}</button></td></tr>)}
          {!videos.length && <tr><td colSpan={4}>No videos uploaded yet.</td></tr>}
        </tbody>
      </table></div>
    </>
  );
}
