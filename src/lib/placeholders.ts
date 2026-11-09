import type { Episode, Article, Guest, Sponsor } from './api';

// Shown only when Supabase is not configured yet, so the site still looks complete while you build.
export const DEMO_EPISODES: Episode[] = [
  { id: 'd3', num: 3, title: 'Selling to enterprise customers', guest: 'Guest name, Role, Company', topic: 'Leadership', url: '', desc: 'How a founder landed the first big contract.' },
  { id: 'd2', num: 2, title: 'Hiring your first ten people', guest: 'Guest name, Role, Company', topic: 'Founder stories', url: '', desc: 'Who to hire first, and what went wrong.' },
  { id: 'd1', num: 1, title: 'Building a company from nothing', guest: 'Guest name, Role, Company', topic: 'Founder stories', url: '', desc: 'The first customers, the first hires and the first mistakes.' }
];
export const DEMO_ARTICLES: Article[] = [
  { id: 'a1', category: 'Investment', title: 'Why founders are rethinking early funding', author: 'Editor', date: '', body: 'Placeholder article text. The full story, featured image, author and share buttons appear on the article page.' },
  { id: 'a2', category: 'Leadership', title: 'What a CEO learned from losing a key client', author: 'Editor', date: '', body: 'Placeholder article text.' },
  { id: 'a3', category: 'Innovation', title: 'Small teams building with new tools', author: 'Editor', date: '', body: 'Placeholder article text.' }
];
export const DEMO_GUESTS: Guest[] = [
  { id: 'g1', name: 'Guest Name', role: 'Founder and CEO', company: 'Company', photo: '' },
  { id: 'g2', name: 'Guest Name', role: 'Managing Director', company: 'Company', photo: '' },
  { id: 'g3', name: 'Guest Name', role: 'Investor', company: 'Fund', photo: '' },
  { id: 'g4', name: 'Guest Name', role: 'Entrepreneur', company: 'Brand', photo: '' }
];
export const DEMO_SPONSORS: Sponsor[] = ['Partner One', 'Partner Two', 'Partner Three', 'Partner Four', 'Partner Five'].map((n, i) => ({ id: 's' + i, name: n, url: '', logo: '' }));
