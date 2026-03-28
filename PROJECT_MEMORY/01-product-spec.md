# Product Spec

Last updated: 2026-03-28

## Product Summary

`Dentist_Bunga` is a bilingual-in-code but Indonesian-facing dental clinic web app for drg. Natasya Bunga Maureen. It has two main surfaces:

- Public website for patients.
- Authenticated dashboard for clinic/admin operations.

The application is not just a brochure site. It actively manages schedules, bookings, clinic settings, admin accounts, a logbook, SATUSEHAT patient lookups, and Telegram bot flows.

## Primary User Roles

- Patient/public visitor:
  - View clinic profile and services.
  - Browse available schedule slots.
  - Create an appointment.
  - View an educational interactive tooth-filling simulation.
- Admin/doctor:
  - Log into dashboard.
  - Review and change appointment status.
  - Create and clear available schedule slots.
  - Manage clinic settings and service list.
  - Manage admin accounts and password changes.
  - Maintain clinical logbook entries.
  - Search patient records through SATUSEHAT sandbox/staging.
- Telegram patient:
  - Ask about services and procedures.
  - Browse schedule availability.
  - Create appointments through conversational flow.

## Public Feature Set

- Home page:
  - Hero section with doctor branding.
  - Dynamic services loaded from settings.
  - Public announcement banner loaded from settings.
  - Three-step booking explanation.
  - Interactive simulation CTA.
- Schedule page:
  - Weekly public schedule viewer.
  - Mobile horizontal card layout, desktop grid layout.
- Booking page:
  - 3-step booking flow.
  - Month-view availability heat/indicator system.
  - Slot selection by date.
  - Patient biodata and complaint form.
  - Success state after reservation creation.
- Simulation page:
  - Interactive penambalan gigi flow backed by static image assets in `public/images/simulasi`.
- Login page:
  - NextAuth credential login to dashboard.

## Dashboard Feature Set

- Overview:
  - Today stats.
  - Pending/completed counts.
  - Upcoming appointments.
  - Quick actions.
- Appointments:
  - Search/filter list.
  - Confirm, complete, or cancel booking.
- Schedules:
  - Weekly grid of 7 days.
  - Slot editor modal.
  - Slots derived from settings-based duration and work hours.
- E-Logbook:
  - CRUD logbook entries.
  - Search.
  - Detail modal.
  - Export to Excel and PDF.
- Rekam Medis:
  - SATUSEHAT patient search by NIK or name + DOB + gender.
  - Detail modal with raw FHIR payload toggle.
- Settings:
  - Clinic identity and contact info.
  - Public announcement.
  - Service list.
  - Slot duration and working-hour configuration.
  - Admin management.

## Main Business Rules

- Dashboard routes require authentication.
- Session lifetime is effectively 6 hours and the dashboard shows expiry warnings near timeout.
- Appointment creation defaults to `pending`.
- Schedule slots are controlled manually by admins.
- Slot duration and business hours are set in settings, then used by the schedule editor to generate candidate slot times.
- Sunday is effectively treated as unavailable in schedule UI.
- MongoDB is the primary operational store.
- Google Sheets acts as backup and migration source, not the current primary read store for core entities.

## Current Boundaries And Non-Goals

- No patient self-service account system.
- No payment flow.
- No direct public appointment rescheduling flow.
- No automated real-time slot locking beyond normal backend write behavior.
- No production-grade multi-doctor scheduling model yet; the app still hardcodes `koasId = "bunga"` in many places.
