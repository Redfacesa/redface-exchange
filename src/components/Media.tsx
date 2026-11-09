import { useState } from 'react';
import type { VideoItem } from '../lib/api';
import { embed } from '../lib/util';

/** A thumbnail that turns into a player when clicked. */
export function Player({ url, label }: { url: string; label: string }) {
  const [on, setOn] = useState(false);
  const e = embed(url);
  if (on && e) {
    return e.kind === 'yt'
      ? <iframe className="pbox" src={e.src} title={label} allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
      : <video className="pbox" src={e.src} controls autoPlay playsInline />;
  }
  return (
    <button className={'thumb' + (on ? ' on' : '')} aria-label={'Play ' + label} onClick={() => setOn(!on)}>
      <b>{label.slice(0, 2)}</b><span className="play" />
      <span className="now">{e ? 'Loading player' : 'Add a YouTube or video link to this episode in the dashboard.'}</span>
    </button>
  );
}

export function VideoGrid({ videos }: { videos: VideoItem[] }) {
  if (!videos.length) return null;
  return (
    <section>
      <div className="wrap">
        <h2>New uploads</h2>
        <div className="vgrid">
          {videos.map((v) => (
            <div className="vc" key={v.id}>
              <video controls preload="metadata" playsInline src={v.url} />
              <h3>{v.title}</h3><p>{v.guest}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
