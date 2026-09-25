# Studio Gallery

Full-featured client gallery and business management web app for photographers (Pixieset-style).

**Tech stack:** Next.js 15 (App Router + TypeScript) · Supabase (Auth, DB, Storage) · Tailwind CSS · Stripe · Vercel

---

## Feature progress

| # | Feature                    | Status   |
|---|----------------------------|----------|
| 1 | Photographer authentication| ✅ Done  |
| 2 | Client galleries           | ✅ Done  |
| 3 | Client-side gallery UX     | ✅ Done  |
| 4 | Online store (Stripe)      | ✅ Done  |
| 5 | Booking                    | ✅ Done  |
| 6 | Invoicing                  | ✅ Done  |
| 7 | Client CRM                 | ✅ Done  |

---

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. Copy **Project URL**, **anon key**, and **service_role key** (Settings → API)

### 2. Run the database migration

In the Supabase SQL Editor, paste and run the entire contents of:

```
supabase/migrations/0002_core_tables.sql
```

This creates tables (`clients`, `galleries`, `photos`, `bookings`, `invoices`, `orders`), enums, RLS policies, and the `gallery-photos` storage bucket.

### 3. Create the admin user

Authentication → Users → Add user (email + password). Optionally disable public sign-ups.

### 4. Environment variables

**Local** — copy `.env.local.example` to `.env.local` and fill in values.

**Vercel** — Settings → Environment Variables (Production + Preview):

| Name | Notes |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Must include `https://` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (server only) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL, e.g. `https://studio.vercel.app` |
| `STRIPE_SECRET_KEY` | From Stripe Dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional for future embedded UI |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook endpoint |

### 5. Stripe webhook

1. Stripe Dashboard → Developers → Webhooks → Add endpoint  
2. URL: `https://your-app.vercel.app/api/webhooks/stripe`  
3. Events: `checkout.session.completed`  
4. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`

### 6. Install & run

```bash
npm install --legacy-peer-deps
npm run dev
```

---

## App map

| Path | Who | Purpose |
|------|-----|---------|
| `/login` | Admin | Sign in |
| `/admin` | Admin | Dashboard with live counts |
| `/admin/galleries` | Admin | List / create / edit galleries + photo upload |
| `/admin/clients` | Admin | CRM list + detail with activity |
| `/admin/bookings` | Admin | Bookings by status |
| `/admin/invoices` | Admin | Invoices + Stripe payment link |
| `/admin/orders` | Admin | Store orders + mark fulfilled |
| `/g/[slug]` | Client | Public gallery: grid, lightbox, favorites, cart, checkout |

---

## Key behaviours

- **Galleries:** slug auto from title, optional password (SHA-256), optional expiry, publish toggle, multi-upload with client-side thumbnails, reorder, share link `/g/{slug}`
- **Public gallery:** password gate (sessionStorage), expired state, lightbox, per-photo download, download all, cart with digital / 8×10 / 11×14, Stripe Checkout
- **Invoices:** line-item builder, “Send” creates Stripe Checkout session and marks `sent`; webhook marks `paid`
- **Orders:** created on checkout; webhook marks `paid`; admin can mark `fulfilled`
- **RLS:** authenticated admin has full access; anon can only read published galleries and their photos

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| MIDDLEWARE_INVOCATION_FAILED | Add Supabase env vars on Vercel and **redeploy** |
| Photos not showing | Confirm migration ran (bucket + policies); check `is_published` |
| Checkout fails | Set `STRIPE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` |
| Webhook not updating status | Verify endpoint URL and `STRIPE_WEBHOOK_SECRET` |
