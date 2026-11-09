-- =====================================================================
-- The Redface Exchange: Supabase schema
-- Run once in: Supabase dashboard > SQL Editor > New query > paste > Run
-- Matches the landing page forms and the admin dashboard sections.
-- =====================================================================

-- ---------- helpers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- staff profiles (admin login) ----------
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  role       text not null default 'none' check (role in ('admin','editor','reviewer','none')),
  created_at timestamptz not null default now()
);

-- every new Supabase Auth user gets a profile with NO permissions until an admin sets a role
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.has_role(roles text[])
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = any(roles) from public.profiles where id = auth.uid()), false)
$$;

-- ---------- guests (featured CEOs, founders, personalities) ----------
create table public.guests (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  job_title    text,
  company      text,
  photo_url    text,
  linkedin_url text,
  biography    text,
  featured     boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------- episodes ----------
create table public.episodes (
  id             uuid primary key default gen_random_uuid(),
  episode_number integer,
  title          text not null,
  slug           text,
  guest_name     text,
  guest_id       uuid references public.guests(id) on delete set null,
  topic          text,
  description    text,
  video_url      text,
  audio_url      text,
  thumbnail_url  text,
  status         text not null default 'Draft' check (status in ('Draft','Scheduled','Published')),
  publish_date   date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create unique index episodes_slug_key on public.episodes (slug) where slug is not null;
create index episodes_status_idx on public.episodes (status, publish_date desc);

-- ---------- uploaded videos (admin "Videos" section, shown on the landing page) ----------
create table public.videos (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  guest_name   text,
  episode_id   uuid references public.episodes(id) on delete set null,
  storage_path text not null,           -- path inside the 'videos' storage bucket
  video_url    text not null,           -- public URL
  size_bytes   bigint,
  uploaded_by  uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index videos_created_idx on public.videos (created_at desc);

-- ---------- news and insights ----------
create table public.articles (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  slug               text,
  category           text,
  author_name        text,
  featured_image_url text,
  body               text,
  status             text not null default 'Draft' check (status in ('Draft','Published')),
  publish_date       date,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create unique index articles_slug_key on public.articles (slug) where slug is not null;
create index articles_status_idx on public.articles (status, publish_date desc);

-- ---------- "Become a Guest" applications ----------
create table public.guest_applications (
  id               uuid primary key default gen_random_uuid(),
  full_name        text not null,
  company_name     text not null,
  job_title        text,
  email            text not null,
  phone            text,
  website          text,
  industry         text,
  company_description text,
  biography        text,
  reason           text,
  topics           text,
  linkedin_url     text,
  photo_path       text,                -- file in the private 'applications' bucket
  status           text not null default 'New'
                   check (status in ('New','Under review','Approved','Declined','Contacted','Scheduled')),
  internal_notes   text,
  recording_date   date,
  notified_at      timestamptz,        -- set by scripts/notify.py once the team and applicant are emailed
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index guest_applications_status_idx on public.guest_applications (status, created_at desc);

-- ---------- "Support Us" contributions ----------
create table public.contributions (
  id                 uuid primary key default gen_random_uuid(),
  contributor_name   text,
  contributor_email  text,
  category           text not null default 'General project contribution',
  amount             numeric(12,2) not null check (amount > 0),
  currency           text not null default 'ZAR',      -- confirm with your payment provider
  status             text not null default 'Pending' check (status in ('Pending','Paid','Refunded')),
  payment_provider   text,
  provider_reference text,                              -- set by your payment webhook
  notified_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index contributions_status_idx on public.contributions (status, created_at desc);

-- ---------- sponsorship enquiries ----------
create table public.sponsorship_enquiries (
  id               uuid primary key default gen_random_uuid(),
  company_name     text not null,
  contact_name     text,
  email            text not null,
  phone            text,
  partnership_type text,
  budget_range     text,
  message          text,
  status           text not null default 'New' check (status in ('New','In discussion','Agreed','Closed')),
  notified_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------- contact page messages ----------
create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text not null,
  topic      text,                -- general, guest, sponsorship, partnership
  message    text not null,
  handled    boolean not null default false,
  notified_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- sponsors and partners (logos on the landing page) ----------
create table public.sponsors (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  website_url   text,
  logo_url      text,
  kind          text not null default 'Sponsor' check (kind in ('Sponsor','Partner')),
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

-- ---------- homepage content (hero headline, intro, button label) ----------
create table public.site_content (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.site_content (key, value) values
  ('home', '{"headline":"Where Business Leaders Share Their Stories.","intro":"Long-form conversations with CEOs, founders, entrepreneurs and investors about the journeys, setbacks and lessons behind their businesses.","cta":"Watch Episodes"}')
on conflict (key) do nothing;

-- ---------- media library ----------
create table public.media_assets (
  id           uuid primary key default gen_random_uuid(),
  file_name    text not null,
  file_type    text,
  storage_path text,
  public_url   text,
  uploaded_by  uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array['guests','episodes','articles','guest_applications','contributions','sponsorship_enquiries','site_content']
  loop
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', t || '_updated', t);
  end loop;
end $$;

-- =====================================================================
-- Row level security
-- =====================================================================
alter table public.profiles              enable row level security;
alter table public.guests                enable row level security;
alter table public.episodes              enable row level security;
alter table public.videos                enable row level security;
alter table public.articles              enable row level security;
alter table public.guest_applications    enable row level security;
alter table public.contributions         enable row level security;
alter table public.sponsorship_enquiries enable row level security;
alter table public.contact_messages      enable row level security;
alter table public.sponsors              enable row level security;
alter table public.site_content          enable row level security;
alter table public.media_assets          enable row level security;

-- profiles: you can read your own row; admins manage everyone (users cannot change their own role)
create policy "read own profile"    on public.profiles for select to authenticated using (id = auth.uid());
create policy "admin all profiles"  on public.profiles for all    to authenticated
  using (public.has_role(array['admin'])) with check (public.has_role(array['admin']));

-- public website: read published content only
create policy "public read guests"   on public.guests   for select to anon, authenticated using (featured);
create policy "public read episodes" on public.episodes for select to anon, authenticated using (status = 'Published');
create policy "public read articles" on public.articles for select to anon, authenticated using (status = 'Published');
create policy "public read videos"   on public.videos   for select to anon, authenticated using (true);
create policy "public read sponsors" on public.sponsors for select to anon, authenticated using (true);
create policy "public read content"  on public.site_content for select to anon, authenticated using (true);

-- admins and editors manage website content
create policy "staff manage guests"   on public.guests   for all to authenticated
  using (public.has_role(array['admin','editor'])) with check (public.has_role(array['admin','editor']));
create policy "staff manage episodes" on public.episodes for all to authenticated
  using (public.has_role(array['admin','editor'])) with check (public.has_role(array['admin','editor']));
create policy "staff manage videos"   on public.videos   for all to authenticated
  using (public.has_role(array['admin','editor'])) with check (public.has_role(array['admin','editor']));
create policy "staff manage articles" on public.articles for all to authenticated
  using (public.has_role(array['admin','editor'])) with check (public.has_role(array['admin','editor']));
create policy "staff manage sponsors" on public.sponsors for all to authenticated
  using (public.has_role(array['admin','editor'])) with check (public.has_role(array['admin','editor']));
create policy "staff manage content"  on public.site_content for all to authenticated
  using (public.has_role(array['admin','editor'])) with check (public.has_role(array['admin','editor']));
create policy "staff manage media"    on public.media_assets for all to authenticated
  using (public.has_role(array['admin','editor'])) with check (public.has_role(array['admin','editor']));

-- visitors can SUBMIT forms (insert only, never read back). Status is forced to the starting value.
create policy "public submit application" on public.guest_applications for insert to anon, authenticated
  with check (status = 'New' and internal_notes is null and recording_date is null and notified_at is null);
create policy "public submit enquiry" on public.sponsorship_enquiries for insert to anon, authenticated
  with check (status = 'New' and notified_at is null);
create policy "public submit contact" on public.contact_messages for insert to anon, authenticated
  with check (handled = false and notified_at is null);
create policy "public start contribution" on public.contributions for insert to anon, authenticated
  with check (status = 'Pending' and provider_reference is null and notified_at is null);

-- admins and reviewers handle applications, enquiries, contact messages and contributions
create policy "staff manage applications" on public.guest_applications for all to authenticated
  using (public.has_role(array['admin','reviewer'])) with check (public.has_role(array['admin','reviewer']));
create policy "staff manage enquiries" on public.sponsorship_enquiries for all to authenticated
  using (public.has_role(array['admin','reviewer'])) with check (public.has_role(array['admin','reviewer']));
create policy "staff manage contact" on public.contact_messages for all to authenticated
  using (public.has_role(array['admin','reviewer'])) with check (public.has_role(array['admin','reviewer']));
create policy "staff read contributions" on public.contributions for select to authenticated
  using (public.has_role(array['admin','reviewer']));
create policy "admin change contributions" on public.contributions for update to authenticated
  using (public.has_role(array['admin'])) with check (public.has_role(array['admin']));

-- =====================================================================
-- Storage buckets (file uploads)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('videos',       'videos',       true,  52428800, array['video/mp4','video/webm','video/quicktime']),  -- 50 MB (Supabase free-plan limit)
  ('images',       'images',       true,  10485760, array['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('applications', 'applications', false, 10485760, array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict (id) do nothing;

create policy "staff upload public files" on storage.objects for insert to authenticated
  with check (bucket_id in ('videos','images') and public.has_role(array['admin','editor']));
create policy "staff update public files" on storage.objects for update to authenticated
  using (bucket_id in ('videos','images') and public.has_role(array['admin','editor']));
create policy "staff delete public files" on storage.objects for delete to authenticated
  using (bucket_id in ('videos','images') and public.has_role(array['admin','editor']));
create policy "staff list public files" on storage.objects for select to authenticated
  using (bucket_id in ('videos','images') and public.has_role(array['admin','editor']));

create policy "visitors upload application photo" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'applications');
create policy "reviewers read application photos" on storage.objects for select to authenticated
  using (bucket_id = 'applications' and public.has_role(array['admin','reviewer']));

-- =====================================================================
-- AFTER you create your own login (Supabase > Authentication > Users > Add user),
-- make yourself admin by running this with your email:
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
--
-- Roles: admin = everything, editor = website content, reviewer = applications/enquiries/contributions.
-- =====================================================================
