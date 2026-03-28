# Change Log

## 2026-03-28

- Area: project memory bootstrap
- Change: created the initial `PROJECT_MEMORY` documentation set covering product scope, architecture, routes/APIs, UI system, data models, integrations, and maintenance workflow.
- Memory files updated:
  - `README.md`
  - `01-product-spec.md`
  - `02-architecture.md`
  - `03-routing-api.md`
  - `04-ui-components.md`
  - `05-data-models-integrations.md`
  - `06-maintenance-workflow.md`
  - `07-change-log.md`

- Area: design system
- Change: replaced the shared visual foundation with a neumorphism-oriented healthcare SaaS style in global CSS, public navbar, public footer, and app viewport theme color. Homepage palette constants were also retuned toward the new system.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: neumorphism rollout refinement
- Change: extended the new healthcare SaaS neumorphism system into the dashboard shell, homepage CTA/surface patterns, booking flow styling, and schedule page controls so public and admin views now share the same visual language.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: dashboard component alignment
- Change: restyled the dashboard overview and appointment management pages to use the same neumorphic cards, chips, search input, and action button patterns as the updated public shell and dashboard layout.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: local neumorphism component system
- Change: added a reusable React component layer in `src/components/ui/neumorphism.tsx` and applied it to the dashboard settings and schedule management pages. This repo still does not directly consume the Themesberg Bootstrap package.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: dashboard page migration to local neumorphism components
- Change: extended the reusable local `Neu*` component layer into logbook and rekam medis, covering search surfaces, action buttons, stat cards, and key admin interactions.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: public page migration to local neumorphism components
- Change: finished the login page and rebuilt the interactive simulation page so both now use the shared local `NeuButton`, `NeuCard`, `NeuChip`, `NeuInput`, and `NeuAlert` patterns instead of mixed raw surfaces.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: dashboard shell and appointment view migration
- Change: moved the dashboard layout, overview, and appointments screens onto the shared local neumorphism component layer so the admin shell now uses `NeuCard`, `NeuButton`, `NeuChip`, `NeuInput`, and `NeuIconTile` instead of mostly hand-styled `glass` blocks.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: final dashboard neumorphism cleanup
- Change: removed the remaining raw dashboard glass shells from schedules, logbook, and rekam medis so the admin views now consistently use the local shared neumorphism component layer.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: neumorphism polish pass
- Change: tuned the shared local neumorphism primitives for more consistent sizing, placeholder contrast, and typography, and applied a cleaner surface rhythm to the dashboard overview.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: public shell polish pass
- Change: tightened the shared navbar, footer, and homepage surface spacing so public pages now use the same chip treatment, section width, rounded surface scale, and button height rhythm as the dashboard.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: public copy cleanup
- Change: removed the remaining mojibake artifacts from the homepage so the public neumorphism pass now includes clean labels, CTA text, and simulation/supporting copy.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: final booking, schedule, and logbook neumorphism cleanup
- Change: migrated the remaining booking flow shells and form controls, the public weekly schedule cards/navigation, and the last raw logbook dropdown/form controls onto the shared local neumorphism component system.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: themesberg shadow alignment
- Change: tightened the local neumorphism shadow system to better match Themesberg's visual balance by reducing shadow spread, lowering highlight intensity, and flattening the base surface color across shared primitives.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: themesberg surface normalization
- Change: removed more page-level shadow and highlight overrides from the navbar and homepage so high-traffic public surfaces now follow the shared Themesberg-aligned neumorphism tokens more closely.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: themesberg decorative flattening
- Change: flattened booking selection states and footer decorative surfaces so highlighted public UI no longer relies on glossy gradients or overly wide shadows and reads closer to Themesberg's neutral neumorphism.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: themesberg public accent cleanup
- Change: flattened booking success/loading accents, tightened the shared teeth loader, and reduced homepage accent gradients so public decorative states sit closer to Themesberg's neutral raised-surface style.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: themesberg simulation and medical cleanup
- Change: reduced the remaining gradient-heavy accents in the simulation flow and rekam medis screens so previews, tabs, modal highlights, and helper surfaces now follow the flatter shared neumorphism baseline.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: themesberg dashboard shell cleanup
- Change: flattened the remaining decorative shell treatments in dashboard layout and settings so sidebar surfaces, active nav states, admin cards, and helper banners now align more closely with the shared neutral neumorphism baseline.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: themesberg final audit pass
- Change: completed a final high-impact visual audit across public and dashboard surfaces by flattening the remaining prominent shell glows and date/accent badges so the visible UI now stays closer to the shared Themesberg-style neumorphism baseline.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: hero tooth cta and footer credit
- Change: replaced the rectangular homepage hero card with a tooth-shaped embossed neumorphic panel and updated the footer copyright line to credit Reandy Ferdinanto.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: footer encoding fix
- Change: rewrote Footer.tsx as clean UTF-8 to fix the Turbopack build parse failure and kept the updated footer credit plus tooth-shaped hero CTA in place.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: hero logo asset swap
- Change: replaced the inline hero CTA logo in the embossed tooth panel with the public 	ooth.svg asset.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: hero tooth shape alignment
- Change: updated the homepage hero neumorphic panel so the embossed shell itself now follows the same tooth silhouette as public/tooth.svg, instead of only swapping the center logo.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: pink accent unification and larger hero tooth
- Change: unified the main accent family around #FDACAC variations in shared neumorphism tokens and enlarged the homepage tooth-shaped hero CTA so it dominates the visual area more strongly.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`


- Area: pink accent second pass
- Change: converted the remaining high-traffic public and dashboard accents in booking, jadwal, dashboard overview, appointments, homepage CTA status chip, and the shared teeth loader to the #FDACAC family so color states now match the shared neumorphism system more closely.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: dashboard pink completion and hero tooth shadow refinement
- Change: completed the #FDACAC-family accent pass across the remaining dashboard surfaces and tightened the homepage hero tooth CTA shadow math so the embossed tooth now feels closer to the shared neumorphism component system.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: hero tooth final premium pass and local cleanup
- Change: refined the homepage tooth CTA shadow geometry to feel closer to the shared neumorphic button surfaces and removed local debug artifacts that were intentionally kept out of version control.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: hero tooth button-depth pass
- Change: increased the homepage tooth CTA outer raised shadow and border emphasis so it reads closer to the shared secondary button neumorphism and is visually more obviously lifted.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: hero tooth strong raised pass and pastel logo
- Change: increased the homepage tooth CTA raised shadow and border visibility and changed the shared tooth.svg asset to a pastel pink palette so the hero CTA now reads more obviously lifted and more color-consistent.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`

- Area: hero tooth maximum raised pass
- Change: pushed the homepage tooth CTA much closer to a pure raised neumorphic surface by increasing outer shadow depth, reducing inset treatment, and recoloring the public tooth.svg logo to pastel pink.
- Memory files updated:
  - `04-ui-components.md`
  - `07-change-log.md`
