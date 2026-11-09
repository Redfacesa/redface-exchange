import { PageHead } from '../components/Layout';

export default function About() {
  return (
    <>
      <PageHead title="About" text="A platform where business leaders share their journeys, experiences and lessons." />
      <section className="light"><div className="wrap two">
        <div><h2>The story and purpose</h2></div>
        <div>
          <p>The Redface Exchange is a business interview podcast and media platform. We speak to CEOs, company founders, entrepreneurs, investors and other influential people about how they built what they built.</p>
          <p>The word Exchange refers to exchanging business knowledge, experience and ideas. This is not a cryptocurrency or financial trading platform.</p>
        </div>
      </div></section>
      <section><div className="wrap">
        <h2>Presenters</h2>
        <div className="grid">
          {['Manace Kapinga', 'Nafeesah Smith'].map((n) => <div className="guest" key={n}><div className="ph">{n.split(' ').map((w) => w[0]).join('')}</div><h3>{n}</h3><p>Presenter</p></div>)}
        </div>
      </div></section>
      <section className="light"><div className="wrap">
        <h2>What to expect</h2>
        <div className="steps">
          <div><b>Honest conversations</b>Long-form interviews that cover the setbacks as well as the wins.</div>
          <div><b>Practical lessons</b>Ideas on leadership, investment and innovation you can use.</div>
          <div><b>Varied guests</b>CEOs, founders, entrepreneurs, investors and industry leaders.</div>
        </div>
      </div></section>
    </>
  );
}
