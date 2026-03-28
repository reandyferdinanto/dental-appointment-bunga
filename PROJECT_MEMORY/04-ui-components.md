# UI Components And Design System

Last updated: 2026-03-28

## Visual Direction

The UI direction is a healthcare-friendly neumorphism with SaaS structure:

- cool light slate background
- navy primary
- teal support accent
- blush and peach secondary accents
- raised and inset surfaces instead of frosted glass
- rounded controls with clearer hierarchy
- mobile-first layouts

The intended product feel is calmer, more structured, and more operationally clear for clinic workflow.

## Core Design Tokens

Defined in `src/app/globals.css`:

- `--navy: #4e6785`
- `--navy-deep: #33475f`
- `--teal: #5ca3a3`
- `--pink: #e6a9a3`
- `--peach: #f1d5bf`
- `--cream: #eef3f8`
- `--success: #6ec6a0`
- `--warning: #f59e0b`

Shared utility classes:

- `.glass`
- `.glass-dark`
- `.neu-inset`
- `.neu-card-hover`
- `.btn-neu-primary`
- `.btn-neu-secondary`
- `.input-neu`
- `.chip-neu`
- `.bg-mesh`
- `.blob-pink`
- `.blob-peach`
- `.blob-navy`
- `.gradient-text`
- `.mobile-bottom-nav`
- `.modal-sheet`
- `.tap-feedback`

## Shared Components

### Local Neumorphism Component Layer

Implemented in `src/components/ui/neumorphism.tsx`:

- `NeuCard`
- `NeuButton`
- `NeuInput`
- `NeuTextarea`
- `NeuSelect`
- `NeuChip`
- `NeuAlert`
- `NeuIconTile`

These are local React/Tailwind components inspired by Themesberg Neumorphism UI patterns. They are not direct imports from Themesberg's Bootstrap HTML kit.
### `Navbar`

- Public-site sticky top navigation.
- Desktop links plus mobile drawer.
- Links to home, schedule, booking, and login.
- Uses neumorphic raised buttons and a more SaaS-like brand presentation.

### `Footer`

- Public-site footer.
- Static branding/contact presentation.
- Restyled into a raised light surface instead of a dark marketing footer block.

### `TeethLoader`

- Decorative dental-themed loading illustration.
- Used on schedule and booking views.
- Includes injected keyframe animations and branded copy.

### `Providers`

- App-level provider wrapper.
- Supports session/auth client setup.

## Dashboard Shell

The dashboard layout is a major reusable UI system:

- fixed sidebar on desktop
- bottom nav on mobile
- session expiry warning banner
- branded tooth logo
- protected content shell
- dashboard navigation and mobile header now share the same neumorphic healthcare SaaS surface treatment as the public site

Primary dashboard nav destinations:

- Overview
- Janji Temu
- Jadwal
- E-Logbook
- Rekam Medis
- Pengaturan

## Notable Page-Level UI Patterns

### Home

- Announcement ribbon now uses a softer SaaS info treatment.
- Hero split layout.
- Primary and secondary CTA buttons use shared neumorphic button primitives.
- Service cards use the shared raised-card hover treatment.
- How-it-works uses the same raised surface system.
- Simulation teaser panel uses the same raised surface and secondary button style.
- CTA block is now a raised light healthcare SaaS panel instead of a dark promo band.

### Booking

- 3-step wizard.
- Rich calendar state with slot-density indicators, disabled past dates, disabled Sundays, and month loading animation.
- Inputs and success actions use neumorphic input and button styling.
- Success card after booking creation.

### Jadwal

- Weekly navigation uses the same neumorphic control treatment.
- Mobile horizontal day cards.
- Desktop 7-column schedule grid.
- Info and booking CTA follow the shared surface/button system.

### Appointments

- search input now uses the shared neumorphic input treatment
- status chip filters now use raised pill controls similar to Themesberg-style neumorphic chips
- appointment cards use raised surfaces with softer depth
- quick status actions use shared raised button patterns for confirm, complete, and cancel states

### Schedules

- weekly 7-day grid
- date card actions
- modal slot picker
- quick select-all / clear-all

### Settings

- section-card layout
- slot preview chips
- admin management panels
- change-password and add-admin subflows

### Rekam Medis

- segmented search mode tabs
- search controls now use shared local `NeuInput`, `NeuSelect`, `NeuButton`, and `NeuAlert` components
- results cards
- patient detail modal
- raw JSON toggle
- sandbox test NIK section

### Logbook

- searchable entry list
- top actions, search bar, stat cards, and entry actions now use shared local neumorphism components
- create form modal
- detail modal
- export actions for Excel and PDF
- competency visualization for observed, assisted, and performed

### Dashboard Overview

- stat cards now use the shared raised-card hover treatment
- refresh control uses the shared secondary neumorphic button style
- upcoming appointment rows and quick-action links now match the same raised admin surface system

## UI Maintenance Notes

- Public pages and dashboard now share the same brand palette and depth system, even though their layouts differ.
- Many contact values shown in the footer are still static placeholders, while settings-driven values exist elsewhere.
- The target direction is neumorphism plus healthcare SaaS clarity, not decorative glassmorphism.
- Future changes should favor raised/inset depth, clearer content grouping, and calmer healthcare-safe contrast.

### Login

- auth card now uses `NeuCard`
- session-expired and error states use `NeuAlert`
- email and password fields use `NeuInput`
- primary submit action uses `NeuButton`

### Simulation

- info trigger, playback controls, and step navigation now use shared `NeuButton` patterns
- simulation info modal and step detail panel now use `NeuCard`
- contextual labels and step metadata now use `NeuChip`
- the page is rebuilt around the local neumorphism component layer instead of mixed raw glass surfaces

### Dashboard Shell

- sidebar navigation now uses shared `NeuCard` surfaces for active and inactive states
- mobile header and brand tiles now use `NeuIconTile`
- session warning and shell actions now use shared `NeuButton` treatment

### Dashboard Overview

- refresh action now uses `NeuButton`
- stat cards and quick actions now use `NeuCard` and `NeuIconTile`
- upcoming appointment status pills now use `NeuChip`

### Appointments

- search field now uses `NeuInput`
- filter pills now use shared `NeuButton` variants instead of custom inline styles
- loading, empty, and appointment cards now use `NeuCard`
- status chips and admin actions now use `NeuChip` and `NeuButton`

### Schedules

- week navigation, slot info bar, editor modal, loading cards, and day cards now use `NeuCard`
- slot selection, day actions, and modal actions now use `NeuButton`
- active slots now use `NeuChip`

### Logbook

- add-entry and detail modals now use `NeuCard`
- loading states and entry cards now use `NeuCard`
- primary and secondary modal actions now use `NeuButton`

### Rekam Medis

- patient result cards, detail modal shell, empty state, and sandbox info panel now use `NeuCard`
- more status and metadata pills now use `NeuChip`
- raw dashboard glass shells are removed from the SATUSEHAT search flow

### Polish Baseline

- shared `NeuButton` sizing is now normalized with minimum heights for better alignment across cards, modals, and tables
- shared inputs, selects, and textareas now use softer placeholder contrast for a calmer healthcare SaaS feel
- base cards and chips now use tighter typography and more consistent surface text color
- dashboard overview now uses a tighter vertical rhythm via the shared surface stack pattern and a small context chip under the page heading

### Public Shell Polish

- navbar spacing now uses the shared section shell width and tighter action/button rhythm
- footer utility pills now use the shared chip-neu treatment instead of ad hoc badge styling
- homepage hero, services, simulation, and CTA sections now use the same rounded surface scale and chip treatment as the dashboard
- homepage CTA now uses the shared section shell width and normalized primary button height
### Public Copy Cleanup

- homepage labels and helper copy were normalized to plain UTF-8-safe text so hero badges, CTA copy, and simulation labels no longer show mojibake artifacts
- public neumorphism polish now covers both surface styling and stable readable copy across the homepage shell
### Booking And Schedule Final Migration

- booking success state, step shells, step actions, error state, and patient form fields now use the shared local neumorphism primitives
- weekly schedule navigation and day cards now use shared raised cards, chips, and button treatment instead of raw glass blocks
- logbook export menu surface and add-entry form controls now use the same shared neumorphism layer as the rest of the dashboard
### Themesberg Shadow Alignment

- base neumorphism surfaces were recalibrated toward the flatter Themesberg-style base surface, with smaller opposing shadows and less aggressive top-left highlight
- raised, inset, button, chip, alert, and icon-tile primitives now use tighter shadow geometry so the UI reads closer to real neumorphism instead of soft glassmorphism
### Themesberg Surface Normalization

- navbar shell and active states now rely more on the shared surface tokens instead of custom wide shadows
- homepage announcement, hero card, service cards, simulation badges, and CTA surfaces now defer more to the shared Themesberg-aligned surface baseline
- high-traffic public pages now use fewer page-level shadow overrides, which makes the app read closer to one consistent Themesberg-style neumorphism system
### Themesberg Decorative Flattening

- booking step indicators, selected dates, selected time slots, and helper summary cards now use flatter shared surfaces instead of glossy gradients or oversized highlight shadows
- public footer brand tile, contact tiles, and utility pills now sit on the same reduced-shadow neutral surface system as the navbar and homepage
- decorative public states now stay closer to Themesberg's flatter neumorphism, especially on selected and emphasized elements
### Themesberg Public Accent Cleanup

- booking success state and loading pills now use flatter raised surfaces instead of gradient success badges or glossy accent chips
- the shared teeth loader now sits on a neutral neumorphic surface with reduced glow and tighter dots so loading states feel closer to the main surface system
- homepage hero inset ring, step icons, simulation preview shell, and CTA decorations now rely on flatter neutral surfaces instead of soft tinted gradients
### Themesberg Simulation And Medical Cleanup

- simulation step cards, badges, tip panels, and preview frames now use flatter neutral raised surfaces with color reserved mainly for icon/text accents
- rekam medis search tabs, patient avatars, empty state, detail modal hero, and sandbox helper buttons now use calmer neutral neumorphic surfaces instead of glossy gradients
- dashboard medical views now sit closer to the same Themesberg-aligned accent restraint as the public pages
### Themesberg Dashboard Shell Cleanup

- dashboard sidebar, mobile top bar, warning strip, and active navigation states now use flatter neutral raised surfaces instead of stronger gradients and deeper shell shadows
- dashboard settings banners, helper notices, service rows, and admin list cards now use the same calmer shared surface treatment as the rest of the app
- dashboard shell and configuration screens now read closer to the shared Themesberg-style neutral neumorphism baseline
### Themesberg Final Audit Pass

- public brand shells, login header tile, and the remaining prominent dashboard date badges now use flatter neutral raised surfaces with tighter shadow contrast
- schedule day highlights, appointment date badges, and logbook date badges no longer rely on warm gradient fills for emphasis
- the most visible remaining UI accents now follow the same restrained Themesberg-style neumorphism baseline across public and dashboard flows
### Hero Tooth CTA

- homepage hero visual no longer uses a rectangular neumorphic card on the right side
- the public hero CTA surface is now an embossed tooth-shaped neumorphic panel with the doctor identity and service chips embedded inside the tooth form
- footer copyright text now uses the updated credit line for Reandy Ferdinanto
### Footer Encoding Fix

- footer component was rewritten to clean UTF-8 so Next.js and Turbopack can parse it without rope/string conversion errors
- homepage hero keeps the tooth-shaped embossed neumorphic panel and footer now uses the updated Reandy Ferdinanto copyright line in ASCII-safe text
### Hero Logo Asset

- homepage hero tooth-shaped CTA panel now uses the shared public asset public/tooth.svg for its central logo instead of the previous inline SVG mark
### Hero Tooth Shape Alignment

- homepage hero neumorphism shell now follows the same tooth silhouette path as public/tooth.svg, not just the central logo asset
- the embossed hero CTA shape and the logo asset are now aligned to one consistent tooth form
### Pink Accent Unification

- shared neumorphism accent tokens now lean on variations of #FDACAC instead of the earlier mixed pink, peach, and teal accent family
- homepage hero tooth panel was enlarged substantially so the embossed tooth surface becomes the dominant visual CTA on large screens
- public shell accents like navbar/footer micro-branding now follow the same pink family
### Pink Accent Second Pass

- booking calendar indicators, success state, mini loading teeth, slot legends, and step accents now use the same #FDACAC family instead of mixed green, peach, and orange states
- dashboard overview and appointment status accents now use pink-family status chips, stat cards, and date badges while keeping neutral neumorphic surfaces intact
- public jadwal cards and the shared teeth loader now use the pink-family accent system consistently, including today states and loading illustrations
### Dashboard Pink Completion And Hero Tooth Shadow Refinement

- dashboard shell, settings, schedules, rekam medis, and logbook now use the same #FDACAC-family accent system instead of leftover green, peach, and teal emphasis states
- homepage hero tooth CTA now uses tighter raised and inset shadow geometry so the embossed tooth reads closer to the shared neumorphism components rather than a separate decorative SVG effect
- the tooth CTA keeps the tooth.svg silhouette while using calmer highlight and shadow contrast that better matches Themesberg-style local neumorphism
### Hero Tooth Final Premium Pass

- homepage tooth CTA now uses a tighter raised shadow and shallower inset highlight, closer to the shared secondary button neumorphism depth
- a thin white edge and softer sheen overlay keep the tooth surface readable without making it look like a separate decorative illustration style
- the hero tooth now reads more like a premium raised neumorphism component with the same surface language as the rest of the UI
### Hero Tooth Button-Depth Pass

- homepage tooth CTA now uses a clearer outer raised shadow closer to the shared secondary button treatment, so the tooth reads more obviously as a lifted neumorphic component
- the outline stroke is slightly stronger and the inner sheen is reduced, making the raised contour easier to see at a glance
### Hero Tooth Strong Raised Pass

- homepage tooth CTA now uses a stronger outer raised shadow and a clearer thin edge so the component reads more obviously lifted from the background
- the inner inset effect is reduced further, which keeps the tooth from looking flat or over-embossed and makes the neumorphic raise more visible
- the shared public tooth.svg asset now uses a pastel pink treatment so the center mark matches the UI accent palette
### Hero Tooth Maximum Raised Pass

- homepage tooth CTA now uses a much stronger outer raised shadow profile, intentionally closer to the shared secondary button depth so the lifted effect is immediately visible
- the inset treatment is now minimal, leaving the tooth to read primarily as a raised neumorphic component with a thin bright edge
- the public tooth.svg mark now uses a pastel pink fill and stroke to stay aligned with the CTA shell and the overall accent palette
