import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

const LINKS: [string, string, boolean?][] = [
  ['/', 'Home'], ['/about', 'About'], ['/episodes', 'Episodes'], ['/news', 'News & Insights'],
  ['/guest', 'Become a Guest', true], ['/support', 'Support Us', true], ['/sponsorship', 'Sponsorship'], ['/contact', 'Contact']
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);
  return (
    <>
      <header>
        <div className="wrap bar">
          <Link className="logo" to="/"><i />The Redface Exchange</Link>
          <button className="burger" aria-expanded={open} aria-controls="nav" onClick={() => setOpen(!open)}>Menu</button>
          <nav id="nav" className={open ? 'open' : ''}>
            {LINKS.map(([to, label, mobileOnly]) => (
              <NavLink key={to} to={to} end={to === '/'} className={mobileOnly ? 'mo' : undefined}>{label}</NavLink>
            ))}
          </nav>
          <Link className="btn red sm" to="/guest">Become a Guest</Link>
          <Link className="btn sm" to="/support">Support Us</Link>
        </div>
      </header>
      <main><Outlet /></main>
      <footer>
        <div className="wrap">
          <div className="cols">
            <div>
              <div className="logo" style={{ marginBottom: 14, color: '#fff' }}><i />The Redface Exchange</div>
              <p>General, guest, sponsorship and partnership enquiries: hello@redfaceexchange.com</p>
            </div>
            <div><ul>{LINKS.filter((l) => !l[2]).slice(1).map(([to, label]) => <li key={to}><Link to={to}>{label}</Link></li>)}</ul></div>
            <div>
              <ul>
                <li><Link to="/guest">Become a Guest</Link></li>
                <li><Link to="/support">Support Us</Link></li>
                {['YouTube', 'LinkedIn', 'Instagram', 'X (Twitter)', 'Facebook', 'TikTok'].map((s) => <li key={s}><a href="#social">{s}</a></li>)}
              </ul>
            </div>
          </div>
          <div className="legal">
            <div>© 2026 The Redface Exchange. Privacy policy · Terms and conditions · Contribution disclosure</div>
            <Link to="/admin" className="markl" aria-label="Red Face logo"><img className="mark" src="/logo.png" alt="Red Face logo" width={61} height={56} /></Link>
          </div>
        </div>
      </footer>
    </>
  );
}

export function PageHead({ title, text }: { title: string; text: string }) {
  useEffect(() => { document.title = title + ' | The Redface Exchange'; }, [title]);
  return <div className="phead"><div className="wrap"><h1>{title}</h1><p>{text}</p></div></div>;
}
