import { PageHead } from '../components/Layout';
import { GuestForm } from '../components/Forms';

export default function Guest() {
  return (
    <>
      <PageHead title="Become a guest" text="Apply to appear on The Redface Exchange." />
      <section className="red"><div className="wrap two">
        <div><h2>Tell us your story</h2><p style={{ fontSize: 20, maxWidth: '38ch' }}>Run a company, lead an industry or invest in one? Our team reviews every application and contacts you to arrange a recording date.</p></div>
        <div><GuestForm /></div>
      </div></section>
      <section className="light"><div className="wrap">
        <h2>What happens after you apply</h2>
        <div className="steps">
          <div><b>1. You apply</b>You get a confirmation by email.</div>
          <div><b>2. We review</b>Our team reads every application.</div>
          <div><b>3. We contact you</b>If it is a fit, we reach out to talk through topics.</div>
          <div><b>4. We record</b>We agree a recording date and you join the studio.</div>
        </div>
      </div></section>
    </>
  );
}
