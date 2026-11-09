import { PageHead } from '../components/Layout';
import { SupportForm } from '../components/Forms';

const USES: [string, string][] = [
  ['Production and filming', 'Crew, lighting, editing and publishing each episode.'],
  ['Equipment and studio', 'Cameras, audio and a permanent recording space.'],
  ['Travel and guests', 'Getting the team to guests, and guests to the studio.'],
  ['Marketing', 'Reaching more founders, CEOs and investors.'],
  ['Platform development', 'New features for the website and the archive.']
];

export default function Support() {
  return (
    <>
      <PageHead title="Support the platform" text="Help us build the studio, the team and the reach." />
      <section><div className="wrap two">
        <div><h2>Support The Redface Exchange</h2><p style={{ color: '#cfcfcf' }}>Contributions fund production, equipment, travel, marketing and platform development. They are not investments and carry no ownership or financial return.</p></div>
        <div><SupportForm /></div>
      </div></section>
      <section className="light"><div className="wrap">
        <h2>How contributions are used</h2>
        <div className="steps">{USES.map(([t, d]) => <div key={t}><b>{t}</b>{d}</div>)}</div>
        <p style={{ marginTop: 28, maxWidth: '60ch' }}>Contributions are separate from commercial sponsorship. They do not buy ownership, equity or any financial return.</p>
      </div></section>
    </>
  );
}
