# Eventers — Event Booking & Management Platform

**Live demo:** [ureventers.vercel.app](https://ureventers.vercel.app)

Eventers is a full-stack event platform built with the Next.js App Router. Attendees discover events and pay for tickets online through SSLCommerz; organizers create and manage their own events and see their earnings; admins review events and monitor every payment on the platform. Successful payments trigger an email receipt and live WebSocket notifications for the buyer, the organizer and admins.

---

## Features

**For attendees**
- Browse events with debounced search, Upcoming / Past / All tabs and sorting
- Event pages with ticket packages, seats-left counter, Google Calendar link and share link
- Secure checkout via SSLCommerz (cards, mobile banking, internet banking)
- Failed or cancelled payments can be retried — no stuck bookings
- Email receipt and an in-app notification when a booking is confirmed
- "My bookings" dashboard with payment status

**For organizers**
- Create and **edit** events: details, banner image (Cloudinary), capacity and multiple ticket packages
- Safe editing rules — packages with bookings can be renamed/repriced but not removed, and capacity can't drop below seats sold
- Dashboard with confirmed bookings, gross sales, platform fee and net earnings
- Live notification on every new booking
- Attendee list and payment history for their own events

**For admins**
- Approve / reject / edit / delete events (events with paid bookings can't be deleted)
- Platform-wide payments list (successful, failed, cancelled, pending) with fee breakdown
- User management with safeguards (no self-delete, no deleting users with events or paid bookings)

**Platform**
- 20% platform fee on every booking (`PLATFORM_FEE_RATE` in `src/lib/fees.ts`); attendees pay the listed price, organizers receive 80%
- Role-based access (Admin, Organizer, User) via an HTTP-only JWT cookie
- Real-time notifications over WebSockets on Vercel Functions, with a notification panel and history
- Light and dark mode
- Payment verification against the SSLCommerz validation API (amount, currency and transaction ID) before anything is marked paid

## Tech stack

| Area | Tools |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack), React 19, TypeScript |
| Data | PostgreSQL (Neon), Prisma ORM |
| State / fetching | Redux Toolkit + RTK Query (axios base query) |
| UI | Tailwind CSS v4, shadcn/ui (Radix), lucide-react, Framer Motion, Sonner |
| Payments | SSLCommerz (sandbox or live) |
| Media | Cloudinary (banner uploads) |
| Email | Nodemailer over SMTP |
| Realtime | WebSockets via `@vercel/functions` + `ws`, fanned out with Postgres `LISTEN/NOTIFY` |
| Validation | Zod |
| Hosting | Vercel |

---

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (the project uses [Neon](https://neon.tech); any Postgres works)
- An SSLCommerz sandbox store ([developer portal](https://developer.sslcommerz.com/))
- A Cloudinary account (for banner uploads)
- An SMTP account for emails (e.g. Gmail with an App Password)

### 1. Clone and install

```bash
git clone https://github.com/RaxonRafi/eventplanner.git
cd eventplanner
npm install        # also runs `prisma generate`
```

### 2. Environment variables

Copy the template and fill it in:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection string (used by the app) |
| `DIRECT_URL` | Direct (non-pooled) connection — used by migrations and the realtime `LISTEN` connection |
| `NEXTAUTH_SECRET` | Secret for signing JWTs. Generate with `openssl rand -base64 48` |
| `SSL_MODE` | `sandbox` (default) or `live` |
| `SSL_STORE_ID`, `SSL_STORE_PASS` | SSLCommerz store credentials |
| `SSL_IPN_URL` | Optional IPN endpoint, e.g. `https://your-domain/api/payment/ipn` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Banner image uploads |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Outgoing email (Gmail: `smtp.gmail.com`, port `465`, App Password) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Super admin account created by the seed script |
| `DEMO_PASSWORD` | Password for the seeded demo organizers and users |

Payment callback URLs (success / fail / cancel) are built from the request origin automatically, so they work on localhost, preview and production without extra configuration.

> Never commit `.env*` files — they're git-ignored (except `.env.example`).

### 3. Database

```bash
npm run db:migrate   # prisma migrate deploy
npm run db:seed      # super admin + demo organizers, users, events and bookings
```

### 4. Run

```bash
npm run dev          # http://localhost:3000 (seeds the database first)
```

`npm run dev` doesn't support WebSocket upgrades, so the notification bell falls back to refreshing every 30 seconds. To get live push notifications locally, run the app through the Vercel CLI (54.14.2 or newer):

```bash
npx vercel@latest dev
```

### Testing payments

In sandbox mode, use SSLCommerz's test card on the checkout page:

| Field | Value |
|---|---|
| Card number | `4111 1111 1111 1111` |
| Expiry | any future date |
| CVV | `111` |

On the OTP page, choose **Success** or **Failed** to simulate either outcome.

### Demo accounts

After seeding: the super admin uses `ADMIN_EMAIL` / `ADMIN_PASSWORD`; organizers are `organizer1@demo.com` and `organizer2@demo.com`, and attendees are `user1@demo.com` … `user8@demo.com`, all with `DEMO_PASSWORD`.

---

## How payments work

```
Book now ──► POST /api/rsvp ──► RSVP (PENDING) + Payment (UNPAID) ──► SSLCommerz checkout
                                                                           │
             ┌─────────────── browser redirect ◄─────────────────────────┤
             ▼                                                             ▼
   /api/payment/success | fail/[tranId] | cancel/[tranId]        /api/payment/ipn (server-to-server)
             │                                                             │
             └──────────► validate val_id with SSLCommerz ◄───────────────┘
                                   │  (amount, currency, tran_id must match)
                                   ▼
                     Payment PAID + RSVP CONFIRMED (exactly once)
                                   │
                 email receipt + notifications (buyer, organizer, admins)
```

- Payments are only marked paid after server-side validation; a forged callback lands on the fail page.
- The browser callback and the IPN can both arrive — the paid transition is atomic, so notifications and emails are sent once.
- A failed, cancelled or abandoned payment leaves the RSVP unpaid, and booking again reuses it.

## Realtime notifications

Vercel pins each WebSocket to the function instance that accepted it, while payment callbacks usually run on a different instance. Notifications are bridged with Postgres `LISTEN/NOTIFY`:

1. A confirmed payment stores `Notification` rows and calls `pg_notify`.
2. Every instance holding sockets `LISTEN`s on a direct database connection and forwards messages to its connected users (`src/lib/realtime.ts`).
3. Clients connect to `/api/ws` and reconnect with backoff (Vercel closes sockets at the function's max duration). They refresh the notification panel on reconnect so nothing is missed.

WebSockets on Vercel require [Fluid compute](https://vercel.com/docs/fluid-compute), which is on by default for projects created after April 2025.

---

## Project structure

```
src/
  app/
    (site)/                 public site — home, events, event details, payment result pages
    (auth)/                 login, register
    dashboard/              role-based dashboard
      admin/  events/  events/create/  events/[id]/edit/
      rsvps/  payments/  users/  notifications/
    api/
      events/               public listing, CRUD, organizer list, status review
      rsvp/                 create booking + start payment, listings
      payment/              success, fail, cancel and IPN callbacks
      payments/             payments list with fee breakdown
      notifications/        list + mark as read
      ws/                   WebSocket endpoint
      dashboard/ admin/     stats
      upload/               Cloudinary banner upload
      users/ auth/          users, login/logout
  components/               UI (shadcn/ui in components/ui, dashboard shell in components/dashboard)
  services/                 payment (SSLCommerz) and notification services
  lib/                      prisma client, auth, fees, mailer, realtime, validators
  redux/                    store and RTK Query endpoints
prisma/                     schema, migrations, seed
```

## API overview (selected)

| Method & path | Access | Description |
|---|---|---|
| `GET /api/events/public` | Public | Approved events — `q`, `sort` (`latest`/`soonest`/`date_desc`), `when` (`upcoming`/`past`/`all`), pagination |
| `GET /api/events/[id]` | Public / owner / admin | Event with organizer and packages |
| `POST /api/events` | Organizer, admin | Create event (validated with Zod) |
| `PATCH /api/events/[id]` | Owner, admin | Edit event and packages |
| `DELETE /api/events/[id]` | Owner, admin | Delete (refused if there are paid bookings) |
| `PATCH /api/events/[id]/status` | Admin | Approve / reject |
| `POST /api/rsvp` | Signed in | Book a package and get the SSLCommerz `paymentUrl` |
| `GET /api/rsvp/my` | Signed in | Your bookings |
| `GET /api/payments` | Organizer, admin | Payments with platform fee and organizer payout |
| `GET /api/notifications` / `PATCH` | Signed in | List / mark as read |
| `GET /api/ws` | Signed in | WebSocket upgrade for live notifications |

Errors are returned as `{ "error": string }` with an appropriate HTTP status.

## Deployment (Vercel)

1. Import the repository in Vercel.
2. Add every variable from `.env.example` under **Settings → Environment Variables** (Production). Use a production-only `NEXTAUTH_SECRET`, and don't set `NODE_ENV` — Vercel manages it.
3. Run migrations against the production database: `npm run db:migrate`.
4. In the SSLCommerz merchant panel, set the IPN URL to `https://<your-domain>/api/payment/ipn`.
5. For real payments, set `SSL_MODE=live` with live store credentials.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Seed, then start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Seed, then start the production server |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed admin, demo users and events |

> On Git Bash / Windows, run tools through npm or `npx` (e.g. `npx next build`) — they're installed locally, not globally. Don't run `npm run build` while the dev server is running; both use the `.next` folder.

## License

MIT
