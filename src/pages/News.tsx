import { useState } from 'react';
import { configured, listArticles } from '../lib/api';
import type { Article } from '../lib/api';
import { useLoad } from '../lib/hooks';
import { fmtDate } from '../lib/util';
import { DEMO_ARTICLES } from '../lib/placeholders';
import { PageHead } from '../components/Layout';

export default function News() {
  const arts = useLoad<Article[]>(listArticles, []);
  const A = configured ? arts : DEMO_ARTICLES;
  const [cat, setCat] = useState('All');
  const cats = ['All', ...Array.from(new Set(A.map((a) => a.category)))];
  return (
    <>
      <PageHead title="News and insights" text="Business news, founder stories and analysis on entrepreneurship, investment and leadership." />
      <section className="light"><div className="wrap">
        <h2>Latest articles</h2>
        <div className="tools">{cats.map((c) => <button key={c} type="button" className="pill" aria-pressed={c === cat} onClick={() => setCat(c)}>{c}</button>)}</div>
        {A.filter((a) => cat === 'All' || a.category === cat).map((a) => (
          <details key={a.id}>
            <summary>{a.title}</summary>
            <p className="meta" style={{ color: '#666' }}>{[a.category, a.author && 'By ' + a.author, fmtDate(a.date)].filter(Boolean).join(' · ')}</p>
            <p style={{ whiteSpace: 'pre-line' }}>{a.body}</p>
          </details>
        ))}
        {!A.length && <p>No articles published yet.</p>}
      </div></section>
    </>
  );
}
