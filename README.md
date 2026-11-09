# The Redface Exchange: website and admin dashboard

Stack: React + TypeScript (Vite), PL/pgSQL (Supabase database), Python (email notifications), HTML/CSS.
The website and the admin dashboard are one React app connected to Supabase.

## Folder layout
- `index.html`              Vite entry page (fonts, page title)
- `src/main.tsx, App.tsx`   app start and page routes
- `src/pages/`              Home, About, Episodes, News, Guest, Support, Sponsorship, Contact, Admin
- `src/components/`         header and footer, video player, forms
- `src/lib/api.ts`          every call to Supabase (login, data, uploads, forms)
- `src/lib/sections.ts`     the dashboard sections, fields and role access
- `src/styles.css`          black, white and red styling
- `public/logo.png`         your logo (the footer logo opens the admin login)
- `supabase/schema.sql`     database tables, security rules and storage buckets
- `scripts/notify.py`       Python script that emails your team and applicants

## 1. Create the database
1. Create a project at https://supabase.com.
2. SQL Editor > New query, paste all of `supabase/schema.sql`, click **Run**.
3. Authentication > Users > Add user: create your admin email and password.
4. Back in the SQL Editor run (with your email):
   `update public.profiles set role = 'admin' where email = 'you@example.com';`
5. Recommended: Authentication > Providers > Email, turn off "Allow new users to sign up".

## 2. Connect the app
Copy `.env.example` to `.env`, then paste in the Project URL and `anon` public key from Project Settings > API.
Never put the `service_role` key in this folder.

## 3. Run it in VS Code
Open the folder, open the terminal (Ctrl+`) and run:

    npm install     # first time only
    npm run dev     # starts Vite at http://localhost:3000

Other commands: `npm run typecheck`, `npm run build` (production files in `dist/`), `npm run preview`.
Without a `.env` the site shows demo content, so you can design before the database exists.
Admin login: click the logo at the bottom right of the footer, or go to /admin.

## What is stored where
| Site or dashboard feature | Table / bucket |
|---|---|
| Become a Guest form | `guest_applications`, photo in private bucket `applications` |
| Sponsorship form | `sponsorship_enquiries` |
| Contact form | `contact_messages` |
| Support Us pledge (saved as Pending) | `contributions` |
| Episodes, guests, articles, sponsors, media | `episodes`, `guests`, `articles`, `sponsors`, `media_assets` |
| Video upload (shown on Home and Episodes) | `videos` and public bucket `videos` (50 MB per file) |
| Homepage text | `site_content` (key `home`) |
| Admin login and roles | Supabase Auth + `profiles` (admin, editor, reviewer) |

Episodes take a YouTube link or a direct video file link in the "Video URL" field.

## Email notifications (Python)
`scripts/notify.py` emails your team about new applications, enquiries, contact messages and pledges, sends the applicant or contributor a short confirmation, and marks each row as notified. Python 3 only, no packages.

    # Mac/Linux (use `set` instead of `export` in Windows cmd)
    export SUPABASE_URL=https://YOUR-PROJECT.supabase.co
    export SUPABASE_SERVICE_KEY=your-service-role-key   # secret, server only
    export SMTP_HOST=smtp.example.com SMTP_USER=... SMTP_PASS=...
    export MAIL_FROM=hello@yourdomain.com ADMIN_EMAIL=team@yourdomain.com
    python scripts/notify.py --dry-run     # preview first
    python scripts/notify.py --every 60    # then run it continuously

## Not included yet
- **Real payments**: contributions are saved as Pending. A payment provider webhook running on a server (a small Python service) should mark them Paid.
- **Spam protection**: add Cloudflare Turnstile to the public forms before launch.
- **Search engines**: a Vite app is built in the visitor's browser, which Google reads less well than server-built pages. If SEO matters most, move to Next.js later; the components, `api.ts` and the database carry over.
- **Analytics**: the dashboard chart is sample data until you add an analytics service.
- Currency is set to `ZAR` in the `contributions` table. Change it once you pick a provider.
