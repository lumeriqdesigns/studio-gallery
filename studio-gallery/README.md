# Studio Gallery

Full-featured client gallery and business management web app for photographers (Pixieset-style).

**Tech stack:** Next.js 15 (App Router + TypeScript) · Supabase (Auth, DB, Storage) · Tailwind CSS · Stripe · Vercel

---

## Feature progress

| # | Feature                    | Status   |
|---|----------------------------|----------|
| 1 | Photographer authentication| ✅ Done  |
| 2 | Client galleries           | Pending  |
| 3 | Client-side gallery UX     | Pending  |
| 4 | Online store (Stripe)      | Pending  |
| 5 | Booking                    | Pending  |
| 6 | Invoicing                  | Pending  |
| 7 | Client CRM                 | Pending  |

---

## Feature 1 — Photographer authentication (complete)

What was built:

- Next.js App Router project with TypeScript + Tailwind CSS v4
- Supabase SSR clients (`src/lib/supabase/client.ts`, `server.ts`, `middleware.ts`)
- Middleware that protects `/admin/*` routes and refreshes sessions
- Login page at `/login` (email + password)
- Auth callback route at `/auth/callback`
- Protected admin layout with sidebar navigation (Dashboard, Galleries, Bookings, Invoices, Orders, Clients)
- Sign-out button
- Clean minimal UI (mobile-first)

### Setup steps you need to complete

#### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Note your **Project URL** and **anon public** key (Settings → API)
3. Also copy the **service_role** key (keep it secret)

#### 2. Create the admin user

In the Supabase dashboard:

1. Go to **Authentication → Users → Add user**
2. Create a user with the email/password you will use to log in
3. Confirm the email (or disable email confirmation under Authentication → Providers → Email for development)

Alternatively, once the app is running you can use the Supabase dashboard SQL editor or Auth UI to create the single admin account.

#### 3. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...   # server-only

# Stripe — leave blank for now (Feature 4+)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 4. Install dependencies & run

```bash
cd studio-gallery
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:3000 → click **Photographer login** → sign in with the admin user you created.

You should be redirected to `/admin` (the protected dashboard). Signing out returns you to `/login`. Visiting `/admin` while logged out redirects to login.

#### 5. (Optional) Disable public sign-ups

Under **Authentication → Providers → Email**, turn off “Enable sign ups” so only the single admin account you created can exist.

---

## Project structure (current)

```
studio-gallery/
├── src/
│   ├── app/
│   │   ├── (auth)/login/     # Login page
│   │   ├── admin/            # Protected admin area
│   │   ├── auth/callback/    # OAuth / code exchange
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Public landing
│   │   └── globals.css
│   ├── components/
│   │   └── SignOutButton.tsx
│   ├── lib/supabase/
│   │   ├── client.ts         # Browser client
│   │   ├── server.ts         # Server client (cookies)
│   │   └── middleware.ts     # Session + route protection
│   └── middleware.ts         # Next.js middleware entry
├── .env.local.example
└── package.json
```

---

## Next up (Feature 2)

- Database tables: `galleries`, `photos`, `clients`
- Admin UI to create a gallery (title, client name, event date, cover)
- Multi-photo upload → Supabase Storage + thumbnail generation
- Unique private shareable links (`/g/[slug]`)
- Optional password + expiry on galleries
- Row-level security so only the authenticated admin can manage data

After you complete the env setup above and confirm login works, reply and we will implement Feature 2.
