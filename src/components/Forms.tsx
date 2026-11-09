import { useState } from 'react';
import { useForm } from '../lib/hooks';
import * as api from '../lib/api';

const Ok = ({ children, st }: { children: string; st: { s: string; msg: string } }) =>
  st.s === 'done' ? <div className="ok" role="status" style={{ display: 'block' }}>{children}</div>
  : st.s === 'error' ? <div className="ok" role="alert" style={{ display: 'block' }}>Sorry, that did not send: {st.msg}</div> : null;

export function GuestForm() {
  const { st, onSubmit } = useForm((d, f) => {
    const photo = (f.elements.namedItem('photo') as HTMLInputElement).files?.[0];
    return api.submitGuest(d as unknown as api.GuestApplication, photo);
  });
  if (st.s === 'done') return <Ok st={st}>Application received. Our team will review it and reply by email.</Ok>;
  return (
    <>
      <form onSubmit={onSubmit}>
        <label>Full name<input name="full_name" required autoComplete="name" /></label>
        <label>Company name<input name="company_name" required /></label>
        <label>Email address<input name="email" type="email" required autoComplete="email" /></label>
        <label>Job title<input name="job_title" required /></label>
        <label>Phone number<input name="phone" type="tel" autoComplete="tel" /></label>
        <label>Company website<input name="website" type="url" placeholder="https://" /></label>
        <label>Industry
          <select name="industry">{['Technology', 'Finance and investment', 'Retail and consumer', 'Energy and mining', 'Media and marketing', 'Other'].map((i) => <option key={i}>{i}</option>)}</select>
        </label>
        <label>LinkedIn profile<input name="linkedin_url" type="url" placeholder="https://linkedin.com/in/" /></label>
        <label>Short company description<textarea name="company_description" /></label>
        <label>Personal or company biography<textarea name="biography" required /></label>
        <label>Why would you like to appear?<textarea name="reason" required /></label>
        <label>Topics you would like to discuss<textarea name="topics" /></label>
        <label>Profile photo or company logo (optional)<input name="photo" type="file" accept="image/*" /></label>
        <button className="btn" style={{ background: '#000', borderColor: '#000' }} type="submit" disabled={st.s === 'sending'}>{st.s === 'sending' ? 'Sending...' : 'Send application'}</button>
      </form>
      <Ok st={st}>.</Ok>
    </>
  );
}

export function SponsorForm() {
  const { st, onSubmit } = useForm((d) => api.submitEnquiry(d as any));
  if (st.s === 'done') return <Ok st={st}>Enquiry sent. Our partnerships team will reply by email.</Ok>;
  return (
    <>
      <form onSubmit={onSubmit}>
        <label>Company<input name="company_name" required /></label>
        <label>Contact person<input name="contact_name" /></label>
        <label>Work email<input name="email" type="email" required /></label>
        <label>Partnership type
          <select name="partnership_type">{['Episode sponsorship', 'Brand placement', 'Sponsored content', 'Advertising', 'Event partnership', 'Production partnership', 'Long-term media partnership'].map((i) => <option key={i}>{i}</option>)}</select>
        </label>
        <label>Budget range<select name="budget_range">{['Not sure yet', 'Small', 'Medium', 'Large'].map((i) => <option key={i}>{i}</option>)}</select></label>
        <label>Message<textarea name="message" /></label>
        <button className="btn red" type="submit" disabled={st.s === 'sending'}>{st.s === 'sending' ? 'Sending...' : 'Send enquiry'}</button>
      </form>
      <Ok st={st}>.</Ok>
    </>
  );
}

export function ContactForm() {
  const { st, onSubmit } = useForm((d) => api.submitContact(d as any));
  if (st.s === 'done') return <Ok st={st}>Message sent. We will reply by email.</Ok>;
  return (
    <>
      <form onSubmit={onSubmit}>
        <label>Name<input name="name" autoComplete="name" /></label>
        <label>Email<input name="email" type="email" required autoComplete="email" /></label>
        <label>Topic
          <select name="topic">{['General enquiry', 'Guest application', 'Sponsorship', 'Partnership'].map((i) => <option key={i}>{i}</option>)}</select>
        </label>
        <label>Message<textarea name="message" required /></label>
        <button className="btn red" type="submit" disabled={st.s === 'sending'}>{st.s === 'sending' ? 'Sending...' : 'Send message'}</button>
      </form>
      <Ok st={st}>.</Ok>
    </>
  );
}

const AMOUNTS = [250, 500, 1000, 2500];
const CATEGORIES = ['General project contribution', 'Podcast production and filming', 'Equipment and studio development', 'Travel and guest expenses', 'Marketing and distribution', 'Platform development'];

export function SupportForm() {
  const [amt, setAmt] = useState<number>(500);
  const [custom, setCustom] = useState('');
  const value = parseInt(custom, 10) || amt;
  const { st, onSubmit } = useForm((d) => api.addContribution({ name: d.name || '', email: d.email || '', category: d.category, amount: value }));
  if (st.s === 'done') return <div className="ok" role="status" style={{ display: 'block' }}>Thank you. Your pledge of {value.toLocaleString('en-ZA')} has been recorded.</div>;
  return (
    <>
      <form onSubmit={onSubmit}>
        <label>Where should your contribution go?<select name="category">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Your name (optional)<input name="name" autoComplete="name" /></label>
        <label>Your email (optional)<input name="email" type="email" autoComplete="email" /></label>
        <div>
          <div className="chips" role="group" aria-label="Contribution amount">
            {AMOUNTS.map((a) => <button type="button" key={a} className="chip" aria-pressed={!custom && amt === a} onClick={() => { setAmt(a); setCustom(''); }}>{a.toLocaleString('en-ZA')}</button>)}
          </div>
          <label>Other amount<input inputMode="numeric" placeholder="Enter your own amount" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ''))} /></label>
        </div>
        <button className="btn red" type="submit" disabled={st.s === 'sending'}>{st.s === 'sending' ? 'Sending...' : 'Contribute'}</button>
      </form>
      {st.s === 'error' && <div className="ok" role="alert" style={{ display: 'block' }}>Sorry, that did not go through: {st.msg}</div>}
      <p className="note">Contributions are separate from sponsorship and carry no ownership or financial return. Currency and payment provider to be confirmed.</p>
    </>
  );
}
