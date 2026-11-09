import { Link } from 'react-router-dom';
import { configured, DEFAULT_HOME, getHome, listArticles, listEpisodes, listGuests, listSponsors, listVideos } from '../lib/api';
import type { Article, Episode, Guest, Sponsor, VideoItem } from '../lib/api';
import { useLoad } from '../lib/hooks';
import { initials } from '../lib/util';
import { DEMO_ARTICLES, DEMO_EPISODES, DEMO_GUESTS, DEMO_SPONSORS } from '../lib/placeholders';
import { Player, VideoGrid } from '../components/Media';
import { SupportForm } from '../components/Forms';

export default function Home() {
  const demo = !configured;
  const home = useLoad(getHome, DEFAULT_HOME);
  const eps = useLoad<Episode[]>(listEpisodes, []);
  const vids = useLoad<VideoItem[]>(listVideos, []);
  const guests = useLoad<Guest[]>(listGuests, []);
  const arts = useLoad<Article[]>(listArticles, []);
  const sponsors = useLoad<Sponsor[]>(listSponsors, []);
  const E = demo ? DEMO_EPISODES : eps, G = demo ? DEMO_GUESTS : guests, A = demo ? DEMO_ARTICLES : arts, S = demo ? DEMO_SPONSORS : sponsors;
  const latest = E[0];

  return (
    <>
      <div className="hero"><div className="wrap">
        <h1>{home.headline.split(/(\bshare\b)/i).map((p, i) => (/^share$/i.test(p) ? <span key={i}>{p}</span> : p))}</h1>
        <p>{home.intro}</p>
        <div className="row">
          <Link className="btn red" to="/episodes">{home.cta}</Link>
          <Link className="btn" to="/guest">Become a Guest</Link>
          <Link className="btn" to="/support">Support the Platform</Link>
          <Link className="btn" to="/sponsorship">Become a Sponsor</Link>
        </div>
      </div></div>

      {latest && (
        <section><div className="wrap">
          <h2>Latest episode</h2>
          <div className="feat">
            <Player url={latest.url} label={String(latest.num ?? latest.title)} />
            <div>
              <p className="meta">Episode {latest.num} · {latest.topic}</p>
              <h3>{latest.title}</h3>
              <p style={{ color: '#cfcfcf' }}>{latest.desc}</p>
              <p className="meta">Guest: {latest.guest}</p>
              <div className="row"><Link className="btn red sm" to="/episodes">Watch now</Link><Link className="btn sm" to="/episodes">All episodes</Link></div>
            </div>
          </div>
        </div></section>
      )}

      <VideoGrid videos={vids} />

      {G.length > 0 && (
        <section className="light"><div className="wrap">
          <h2>Featured founders and CEOs</h2>
          <div className="grid">
            {G.map((g) => (
              <div className="guest" key={g.id}>
                <div className="ph">{g.photo ? <img src={g.photo} alt="" /> : initials(g.name)}</div>
                <h3>{g.name}</h3><p>{[g.role, g.company].filter(Boolean).join(', ')}</p>
              </div>
            ))}
          </div>
        </div></section>
      )}

      {A.length > 0 && (
        <section><div className="wrap">
          <h2>Business news and insights</h2>
          <p style={{ margin: '-12px 0 28px' }}><Link className="btn sm" to="/news">Read all articles</Link></p>
          <div className="news">
            {A.slice(0, 3).map((a) => (
              <Link to="/news" key={a.id}><time>{a.category}</time><div><h3>{a.title}</h3><p style={{ color: '#bbb' }}>{a.author && 'By ' + a.author}</p></div></Link>
            ))}
          </div>
        </div></section>
      )}

      <section className="light"><div className="wrap two">
        <div><h2>About The Redface Exchange</h2></div>
        <div>
          <p>The Exchange is an exchange of knowledge, experience and ideas between people who build businesses. It is not a cryptocurrency or trading platform.</p>
          <p>Presenters <b>Manace Kapinga</b> and <b>Nafeesah Smith</b> sit down with leaders to hear how they started, what went wrong and what they would do again.</p>
          <Link className="btn sm" style={{ borderColor: '#000', color: '#000' }} to="/about">Read our story</Link>
        </div>
      </div></section>

      <section className="red"><div className="wrap">
        <h2 style={{ maxWidth: '20ch' }}>CEOs and founders: your story belongs here.</h2>
        <p style={{ fontSize: 20, maxWidth: '46ch', margin: '0 0 28px' }}>We feature business owners, entrepreneurs, investors and industry leaders. Applying takes a few minutes and our team reviews every application.</p>
        <Link className="btn" style={{ background: '#000', borderColor: '#000' }} to="/guest">Become a Guest</Link>
      </div></section>

      <section><div className="wrap two">
        <div><h2>Support the platform</h2><p style={{ color: '#cfcfcf' }}>Contributions fund production, equipment, travel, marketing and platform development. They are not investments and carry no ownership or financial return.</p></div>
        <div><SupportForm /></div>
      </div></section>

      <section className="light"><div className="wrap two">
        <div><h2>Sponsor or partner with us</h2></div>
        <div>
          <p>Episode sponsorship, brand placement, disclosed sponsored content, advertising, events and long-term media partnerships.</p>
          <Link className="btn red" to="/sponsorship">Become a Sponsor</Link>
        </div>
      </div></section>

      {S.length > 0 && (
        <section><div className="wrap">
          <h2>Our sponsors and partners</h2>
          <div className="logos">{S.map((s) => <span key={s.id}>{s.name}</span>)}</div>
        </div></section>
      )}
    </>
  );
}
