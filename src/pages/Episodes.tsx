import { useState } from 'react';
import { configured, listEpisodes, listVideos } from '../lib/api';
import type { Episode, VideoItem } from '../lib/api';
import { useLoad } from '../lib/hooks';
import { DEMO_EPISODES } from '../lib/placeholders';
import { PageHead } from '../components/Layout';
import { Player, VideoGrid } from '../components/Media';

export default function Episodes() {
  const eps = useLoad<Episode[]>(listEpisodes, []);
  const vids = useLoad<VideoItem[]>(listVideos, []);
  const E = configured ? eps : DEMO_EPISODES;
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState('All');
  const [open, setOpen] = useState<string | null>(null);
  const topics = ['All', ...Array.from(new Set(E.map((e) => e.topic)))];
  const shown = E.filter((e) => (topic === 'All' || e.topic === topic) && (e.title + ' ' + e.guest + ' ' + e.topic).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHead title="Episodes" text="Every conversation: the guest, the story and the lessons." />
      <VideoGrid videos={vids} />
      <section><div className="wrap">
        <h2>All episodes</h2>
        <div className="tools">
          <input type="search" placeholder="Search episodes or guests" aria-label="Search episodes" value={q} onChange={(e) => setQ(e.target.value)} />
          <span className="row">{topics.map((t) => <button key={t} type="button" className="pill" aria-pressed={t === topic} onClick={() => setTopic(t)}>{t}</button>)}</span>
        </div>
        {shown.map((e) => (
          <div key={e.id}>
            <div className="ep">
              <div className="mini">{e.num}</div>
              <div><p className="meta">Episode {e.num} · {e.topic}</p><h3>{e.title}</h3><p>{e.guest}</p></div>
              <button className="btn red sm" onClick={() => setOpen(open === e.id ? null : e.id)}>{open === e.id ? 'Close' : 'Watch'}</button>
            </div>
            {open === e.id && <div style={{ paddingBottom: 22 }}>{e.desc && <p style={{ color: '#bbb' }}>{e.desc}</p>}<Player url={e.url} label={String(e.num ?? e.title)} /></div>}
          </div>
        ))}
        {!shown.length && <p className="empty">No episodes match. Try another search or topic.</p>}
      </div></section>
    </>
  );
}
