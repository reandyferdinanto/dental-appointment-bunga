# Architecture

Last updated: 2026-03-28

## Stack

- Framework: Next.js 16 App Router
- UI: React 19
- Styling: Tailwind CSS v4 plus custom global CSS utilities
- Auth: NextAuth v5 beta with credentials provider
- Primary database: MongoDB
- Backup and migration layer: Google Sheets via Apps Script endpoint
- Extra integration surfaces:
  - Telegram Bot API
  - SATUSEHAT sandbox/staging API
  - XLSX export

## High-Level Shape

- `src/app`: App Router pages and API routes.
- `src/components`: shared UI shell and reusable components.
- `src/lib`: auth, integrations, validators, database adapters.
- `src/lib/db`: domain-oriented data access helpers.
- `scripts`: support scripts for Redis setup, Telegram polling, env injection, and edge config setup.

## Rendering Model

- Most dashboard and interaction-heavy pages are client components.
- The home page is server-rendered and pulls settings from MongoDB server-side.
- Public APIs are consumed from client pages using `fetch`.
- Route handlers are used for application actions instead of server actions.

## Auth Model

- Middleware protects `/dashboard/:path*`.
- Auth uses NextAuth credentials provider.
- Admin verification order:
  - Environment fallback using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
  - MongoDB admin records.
  - Google Sheets fallback if MongoDB admin collection is empty or unavailable.
- Session strategy is JWT.
- Session age target is 6 hours.
- The dashboard layout also runs a client-side expiry countdown warning.

## Data Strategy

Current effective strategy:

- Read primary data from MongoDB for:
  - appointments
  - schedules
  - logbook
  - settings
  - admins
- On most writes, also send a fire-and-forget backup call to Google Sheets.
- Use `/api/sync` as a one-time or repeated migration path from Google Sheets into MongoDB.

## Important Architectural Reality

The codebase still contains older storage layers and migration artifacts:

- `src/lib/redis.ts`: legacy Edge Config/in-memory adapter, not the current primary store for core product flows.
- `src/lib/db/keys.ts`: legacy Redis-style key patterns.
- README still mentions Upstash Redis, which does not reflect the current main architecture.

Treat those as historical or fallback artifacts unless a future change explicitly reactivates them.

## Settings Flow

- Settings are stored in MongoDB document `_id = "main"`.
- Settings are used by:
  - home page dynamic doctor/service content
  - schedule editor slot generation
  - Telegram bot clinic identity and contact responses
- Time fields are normalized because Google Sheets serializes some values as `1899-12-30T...`.

## Domain Access Pattern

The code uses helper modules in `src/lib/db`:

- `appointments.ts`
- `schedules.ts`
- `logbook.ts`

These encapsulate MongoDB access and Google Sheets backup behavior.

## Integration Layers

- SATUSEHAT:
  - OAuth2 client credentials.
  - In-memory token cache.
  - Patient search and detail retrieval.
- Telegram:
  - Webhook route and polling scripts.
  - Stateful booking conversation stored in in-memory session helper.
- Google Sheets:
  - Apps Script-backed HTTP endpoint.
  - Cache and request dedupe in `src/lib/gsheet.ts`.

## Main Risks To Remember

- Several docs in the repo are older than the actual runtime architecture.
- Hardcoded `koasId` creates coupling to a single-doctor model.
- Telegram sessions are in memory, so they are not durable across cold starts/restarts.
- Some public-facing copy still includes placeholder/static contact details rather than fully dynamic values.
