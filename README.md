## Eventers – Event Planning & RSVP Platform

Eventers is a modern event planning platform built with Next.js App Router. Organizers can create and manage events and packages; users can browse events, RSVP, and pay via SSLCommerz. The app supports role‑based access (Admin, Organizer, User) and a clean, responsive UI.

### Features

- Public site with featured events and full events listing
- Event details pages with packages and RSVP flow (SSLCommerz)
- Auth & roles via JWT cookie (`token`) with Admin, Organizer, User
- Dashboard
  - Admin: users, events, RSVPs, payments
  - Organizer: own events, RSVPs for their events
  - User: “My RSVPs”
- Prisma ORM with PostgreSQL (Supabase), migrations, and type‑safe queries
- RTK Query data layer with axios base query
- Shadcn/UI components, Tailwind v4, dark mode toggle

### Tech Stack

- Next.js 15 (App Router, Turbopack)
- React 19
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- Redux Toolkit + RTK Query
- Shadcn/UI, Tailwind CSS

---

## Getting Started

### 1) Prerequisites

- Node.js 18+ (recommended LTS)
- A PostgreSQL database (Supabase recommended)

### 2) Clone & Install

```bash
git clone https://github.com/RaxonRafi/eventplanner.git
cd event-planner
npm install
```

### 3) Environment Variables

Create `.env` at project root. For Supabase, use Transaction Pooler for `DATABASE_URL` and Direct for `DIRECT_URL`.

```env
# Prisma/Supabase
DATABASE_URL=postgresql://postgres.<project-ref>:[YOUR-PASSWORD]@aws-1-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.<project-ref>.supabase.co:5432/postgres?sslmode=require

# NextAuth/JWT secret used by auth utilities
NEXTAUTH_SECRET=replace-with-strong-secret

# SSLCommerz creds (sandbox or live)
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_SANDBOX=true
```

Notes:

- URL‑encode special characters in passwords.
- Do not commit `.env`.

### 4) Prisma Setup

`prisma/schema.prisma` is configured for PostgreSQL.

Common commands:

```bash
npx prisma generate              # generate Prisma Client
npx prisma migrate deploy        # apply migrations (uses DIRECT_URL under the hood)
npx prisma migrate status        # check migration status
```

This project’s `postinstall` runs only `prisma generate` to avoid DB access during builds (e.g., Vercel). Run `migrate deploy` as a separate step.

### 5) Development

```bash
npm run dev
# App runs at http://localhost:3000
```

---

## Project Structure (key paths)

```
src/app
  (site)/                # public site
    events/              # events listing and [id] details
  (auth)/                # login/register
  api/                   # Next.js Route Handlers
    events/              # events CRUD and public listing
    rsvp/                # RSVP create + listings (admin/organizer/user)
    payment/             # SSLCommerz callbacks
    users/               # current user, admin users
  dashboard/             # protected dashboard (role‑based)

src/components           # UI components
src/redux                # RTK/RTKQ store and endpoints
src/lib                  # prisma client, auth helpers
prisma/                  # schema and migrations
```

---

## Authentication & Roles

- A JWT is stored in a `token` cookie; minimal claims: `{ id, role }`.
- Middleware protects `/dashboard/*` and enforces role access:
  - Admin only: `/dashboard/users`
  - Organizer/Admin: events and payments management
  - All logged‑in users: `/dashboard/rsvps` (users see only their own RSVPs)

Helpers in `src/lib/auth.ts`:

- `getAuth(req)`, `isAdmin(req)`, `isOrganizer(req)`, `isUser(req)`

---

## RSVP & Payments

Flow:

1. On event details, user selects a package and triggers `POST /api/rsvp`
2. API creates `RSVP` and an `UNPAID` `Payment`, then initializes SSLCommerz
3. Client redirects to `paymentUrl`
4. Payment callbacks update payment status

API returns on RSVP create (example):

```json
{
  "paymentUrl": "https://sandbox.sslcommerz.com/...",
  "rsvp": { "id": "...", "status": "PENDING" },
  "payment": { "id": "...", "tranId": "TXN-..." }
}
```

Notes:

- Unauthenticated users are redirected to `/login?redirect=/events/[id]` when attempting to RSVP.
- Users can have only one RSVP per event (unique constraint enforced).

---

## API Overview (selected)

- `GET /api/events/public` – public listing with pagination and optional search
- `GET /api/events/[id]` – single event with organizer, packages
- `POST /api/events` – create (Admin or Organizer)
- `GET /api/rsvp` – admin/organizer listing (organizers scoped to their events)
- `GET /api/rsvp/my` – current user RSVPs
- `POST /api/rsvp` – create RSVP and init payment
- `GET /api/users/me` – current user info

All routes return JSON. Errors use HTTP status codes with `{ error: string }`.

---

## Environment & Deployment

### Local development

- Keep projects outside OneDrive/Dropbox to avoid DLL locks (Prisma engines on Windows).
- If you see `EPERM` during `prisma generate`, stop node processes, delete `node_modules/.prisma/client`, and rerun generate.

### Vercel

- Set `DATABASE_URL` (Transaction Pooler) and `NEXTAUTH_SECRET` in Project → Settings → Environment Variables.
- Do not run migrations during `npm install`. Run `npx prisma migrate deploy` via a separate deployment step or manually.

---

## Scripts

```json
{
  "dev": "next dev --turbopack",
  "build": "next build --turbopack",
  "start": "next start",
  "lint": "eslint",
  "postinstall": "prisma generate"
}
```

---

## Contributing

1. Fork & branch: feature/your-feature
2. Keep changes small and focused
3. Ensure type-check and lint pass
4. Open a PR with a clear description and screenshots where relevant

---

## License

MIT

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
