import { PageHead } from '../components/Layout';
import { SponsorForm } from '../components/Forms';

const OPPS = ['Episode sponsorship', 'Brand placement', 'Sponsored interviews or content, with clear disclosure', 'Advertising placements', 'Event partnerships', 'Production partnerships', 'Long-term media partnerships'];

export default function Sponsorship() {
  return (
    <>
      <PageHead title="Sponsorship and partnerships" text="Work with a platform that reaches founders, CEOs and investors." />
      <section className="light"><div className="wrap two">
        <div><h2>Opportunities</h2><ul style={{ paddingLeft: 20, lineHeight: 1.9 }}>{OPPS.map((o) => <li key={o}>{o}</li>)}</ul></div>
        <div><SponsorForm /></div>
      </div></section>
    </>
  );
}
