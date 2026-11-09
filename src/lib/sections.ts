import type { SectionKey } from './api';

export interface Field { key: string; label: string; type?: 'area' | 'date' }
export interface Sec { st?: string[]; cols: string[]; fields: Field[]; ro?: boolean }

export const SECS: Record<SectionKey, Sec> = {
  applications: {
    st: ['New', 'Under review', 'Approved', 'Declined', 'Contacted', 'Scheduled'],
    cols: ['name', 'company', 'industry', 'date', 'status'],
    fields: [
      { key: 'name', label: 'Full name' }, { key: 'company', label: 'Company' }, { key: 'title', label: 'Job title' },
      { key: 'email', label: 'Email' }, { key: 'industry', label: 'Industry' }, { key: 'date', label: 'Applied on', type: 'date' },
      { key: 'bio', label: 'Biography', type: 'area' }, { key: 'why', label: 'Why they want to appear', type: 'area' },
      { key: 'rec', label: 'Recording date', type: 'date' }, { key: 'notes', label: 'Internal notes', type: 'area' }
    ]
  },
  episodes: {
    st: ['Draft', 'Scheduled', 'Published'],
    cols: ['num', 'title', 'guest', 'date', 'status'],
    fields: [
      { key: 'num', label: 'Episode number' }, { key: 'title', label: 'Title' }, { key: 'guest', label: 'Guest' },
      { key: 'topic', label: 'Topic (Investment, Leadership, Founder stories)' }, { key: 'date', label: 'Publish date', type: 'date' },
      { key: 'url', label: 'Video URL (YouTube or file)' }, { key: 'audio', label: 'Audio URL' }, { key: 'desc', label: 'Description', type: 'area' }
    ]
  },
  guests: {
    cols: ['name', 'role', 'company'],
    fields: [
      { key: 'name', label: 'Name' }, { key: 'role', label: 'Title' }, { key: 'company', label: 'Company' },
      { key: 'photo', label: 'Photo URL' }, { key: 'link', label: 'LinkedIn URL' }, { key: 'bio', label: 'Biography', type: 'area' }
    ]
  },
  articles: {
    st: ['Draft', 'Published'],
    cols: ['title', 'category', 'author', 'date', 'status'],
    fields: [
      { key: 'title', label: 'Headline' }, { key: 'category', label: 'Category' }, { key: 'author', label: 'Author' },
      { key: 'date', label: 'Publish date', type: 'date' }, { key: 'img', label: 'Featured image URL' }, { key: 'body', label: 'Article body', type: 'area' }
    ]
  },
  contributions: {
    st: ['Pending', 'Paid', 'Refunded'], ro: true,
    cols: ['name', 'category', 'amount', 'date', 'status'],
    fields: [
      { key: 'name', label: 'Contributor' }, { key: 'email', label: 'Email' }, { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount' }, { key: 'date', label: 'Date', type: 'date' }
    ]
  },
  enquiries: {
    st: ['New', 'In discussion', 'Agreed', 'Closed'],
    cols: ['company', 'type', 'budget', 'date', 'status'],
    fields: [
      { key: 'company', label: 'Company' }, { key: 'contact', label: 'Contact person' }, { key: 'email', label: 'Email' },
      { key: 'type', label: 'Partnership type' }, { key: 'budget', label: 'Budget range' }, { key: 'date', label: 'Received', type: 'date' },
      { key: 'msg', label: 'Message', type: 'area' }
    ]
  },
  sponsors: {
    st: ['Sponsor', 'Partner'],
    cols: ['name', 'url', 'status'],
    fields: [{ key: 'name', label: 'Name' }, { key: 'url', label: 'Website' }, { key: 'logo', label: 'Logo URL' }]
  },
  media: {
    cols: ['file', 'type'],
    fields: [{ key: 'file', label: 'File name' }, { key: 'type', label: 'Type' }]
  }
};

export const NAMES: Record<string, string> = {
  overview: 'Overview', applications: 'Guest applications', episodes: 'Episodes', videos: 'Videos', guests: 'Guest profiles',
  articles: 'News articles', contributions: 'Contributions', enquiries: 'Sponsorship enquiries', sponsors: 'Sponsors and partners',
  home: 'Homepage content', media: 'Media library'
};
export const ORDER = ['overview', 'applications', 'episodes', 'videos', 'guests', 'articles', 'contributions', 'enquiries', 'sponsors', 'home', 'media'];
export const ACCESS: Record<string, string[]> = {
  Admin: ORDER,
  Editor: ['overview', 'episodes', 'videos', 'guests', 'articles', 'sponsors', 'home', 'media'],
  Reviewer: ['overview', 'applications', 'enquiries', 'contributions']
};
