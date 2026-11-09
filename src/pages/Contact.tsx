import { PageHead } from '../components/Layout';
import { ContactForm } from '../components/Forms';

export default function Contact() {
  return (
    <>
      <PageHead title="Contact" text="General enquiries, guest applications, sponsorship and partnership enquiries." />
      <section><div className="wrap two">
        <div>
          <h2>Get in touch</h2>
          <p style={{ color: '#cfcfcf' }}>Business email: hello@redfaceexchange.com</p>
          <p style={{ color: '#cfcfcf' }}>Want to appear on the show? Use the Become a Guest page. Interested in sponsoring? Use the Sponsorship page.</p>
        </div>
        <div><ContactForm /></div>
      </div></section>
    </>
  );
}
