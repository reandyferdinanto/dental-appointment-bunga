# Routing And API Inventory

Last updated: 2026-03-28

## App Pages

- `/`
  - Public landing page.
  - Server component.
  - Pulls settings from MongoDB.
- `/jadwal`
  - Public weekly schedule viewer.
- `/booking`
  - Public 3-step booking flow.
- `/simulasi`
  - Public interactive treatment simulation.
- `/login`
  - Dashboard login page.
- `/dashboard`
  - Authenticated overview.
- `/dashboard/appointments`
  - Appointment management UI.
- `/dashboard/schedules`
  - Schedule management UI.
- `/dashboard/logbook`
  - Logbook CRUD and exports.
- `/dashboard/rekam-medis`
  - SATUSEHAT patient search.
- `/dashboard/settings`
  - Clinic settings and admin management.

## Shared Layout Routes

- `src/app/layout.tsx`
  - Global metadata, fonts, providers.
- `src/app/dashboard/layout.tsx`
  - Dashboard shell, sidebar, bottom nav, session warning.
- `src/app/loading.tsx`
  - Global loading page.
- `src/app/not-found.tsx`
  - 404 page.

## API Routes

### Appointments

- `GET /api/appointments`
  - List appointments.
  - Publicly callable from current code.
- `POST /api/appointments`
  - Create appointment.
- `GET /api/appointments/[id]`
  - Get appointment by id.
- `PATCH /api/appointments/[id]`
  - Auth required.
  - Update status only.
- `DELETE /api/appointments/[id]`
  - Auth required.

### Schedules

- `GET /api/schedules?week=YYYY-MM-DD`
  - Return 7-day week schedule.
- `GET /api/schedules?date=YYYY-MM-DD`
  - Return one schedule object.
- `POST /api/schedules`
  - Auth required.
  - Accepts `{ date, slots[] }`.

### Settings

- `GET /api/settings`
  - Return normalized clinic settings with defaults fallback.
- `POST /api/settings`
  - Persist settings to MongoDB and back up to Google Sheets.

### Logbook

- `GET /api/logbook`
  - List logbook entries for `bunga`.
- `POST /api/logbook`
  - Auth required.
- `GET /api/logbook/[id]`
  - Auth required.
- `PATCH /api/logbook/[id]`
  - Auth required.
- `DELETE /api/logbook/[id]`
  - Auth required.

### Admin

- `GET /api/admin`
  - Auth required.
  - Returns safe admin list without password hashes.
- `POST /api/admin`
  - Auth required.
  - Multiplexed action endpoint:
    - `add`
    - `change_password`
    - `update`
    - `delete`

### Auth

- `/api/auth/[...nextauth]`
  - NextAuth handler.

### SATUSEHAT

- `GET /api/satusehat`
  - Supports:
    - `type=nik`
    - `type=search`
    - `type=detail`

### Telegram

- `GET /api/telegram/setup`
  - Webhook setup helper.
- `POST /api/telegram/webhook`
  - Receives Telegram updates.
- `GET /api/telegram/webhook`
  - Health-style response.

### Utility / Migration Routes

- `POST /api/seed`
  - Demo/seed path.
- `GET /api/sync`
  - Sync Google Sheets data into MongoDB.
- `GET /api/debug`
  - Debug route.

## Key Client Flows

### Booking Flow

1. User loads month-view availability from `/api/schedules?week=...`.
2. User selects a date and loads exact slots from `/api/schedules?date=...`.
3. User submits patient data to `POST /api/appointments`.
4. Success state renders booking summary.

### Dashboard Schedule Flow

1. Dashboard settings define slot duration and working hours.
2. Schedule page derives candidate slot list in the client.
3. Admin chooses slots for a given date.
4. UI sends `{ date, slots[] }` to `POST /api/schedules`.

### Dashboard Appointment Flow

1. Client fetches `/api/appointments`.
2. Admin updates status via `PATCH /api/appointments/[id]`.

### SATUSEHAT Flow

1. Dashboard page calls `/api/satusehat`.
2. Route fetches OAuth token if needed.
3. Route proxies patient search/detail result back to UI.
