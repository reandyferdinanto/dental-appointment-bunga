# Data Models And Integrations

Last updated: 2026-03-28

## Core Collections

MongoDB collections declared in `src/lib/mongodb.ts`:

- `appointments`
- `logbook`
- `schedules`
- `settings`
- `admins`

## Main Domain Models

### Appointment

Fields:

- `id`
- `patientName`
- `patientPhone`
- `patientEmail?`
- `koasId`
- `date`
- `time`
- `complaint`
- `status`
- `notes?`
- `createdAt`

Behavior:

- created via UUID
- default status is `pending`
- written to MongoDB
- backed up asynchronously to Google Sheets

### Schedule

Fields:

- `date`
- `slots: string[]`
- implicit operational `koasId` defaulting to `bunga`

Behavior:

- stored per date
- week queries materialize a 7-day range
- write path upserts entire date slot array

### Logbook Entry

Fields:

- `id`
- `koasId`
- `appointmentId?`
- `date`
- `patientInitials`
- `procedureType`
- `toothNumber?`
- `diagnosis`
- `treatment`
- `supervisorName`
- `competencyLevel`
- `notes?`
- `createdAt`

### Settings

Main fields currently used:

- `clinicName`
- `doctorName`
- `phone`
- `whatsapp`
- `email`
- `address`
- `slotDurationMinutes`
- `workHourStart`
- `workHourEnd`
- `breakStart`
- `breakEnd`
- `services`
- `instagramUrl`
- `lineId`
- `announcement`

Storage note:

- persisted as a single MongoDB document using `_id = "main"`

### Admin User

Fields:

- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `createdAt`

Password note:

- current supported hash format is `sha256:salt:hash`
- env-based admin fallback still exists
- bcrypt comment exists as legacy/migration note, but current verify path returns `false` for non-`sha256:` hashes

## Validation Schemas

Defined in `src/lib/validators.ts`:

- `appointmentSchema`
- `scheduleSchema`
- `logbookSchema`
- `loginSchema`

Current note:

- not every route enforces these schemas consistently.
- `schedules` explicitly validates.
- some other routes accept body data more directly.

## Google Sheets Integration

Purpose:

- backup sink for writes
- fallback source in some auth/admin cases
- migration source via `/api/sync`

Implementation details:

- Apps Script HTTP endpoint
- per-action TTL cache
- in-flight request dedupe
- cache invalidation on write-like actions

## Telegram Integration

Main pieces:

- `src/lib/telegram/api.ts`
- `src/lib/telegram/bot.ts`
- `src/lib/telegram/sessions.ts`
- `/api/telegram/webhook`

Capabilities:

- informational menus
- educational procedure content
- schedule lookup
- conversational appointment booking

Operational note:

- session state is in memory, not persistent

## SATUSEHAT Integration

Main pieces:

- `src/lib/satusehat.ts`
- `/api/satusehat`

Capabilities:

- get OAuth access token
- search patient by NIK
- search patient by name + DOB + gender
- fetch patient detail
- normalize patient summary for UI

Operational note:

- currently uses sandbox/staging endpoints by default

## Legacy / Historical Files

- `src/lib/redis.ts`
  - old Edge Config adapter with in-memory fallback
- `src/lib/db/keys.ts`
  - old Redis-style key naming

These should not be treated as the primary source of truth for the current app unless future code reintroduces them into active runtime paths.
