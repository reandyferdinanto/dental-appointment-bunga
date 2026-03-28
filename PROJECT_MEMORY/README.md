# Project Memory

Last updated: 2026-03-28

This folder is the persistent memory for the `Dentist_Bunga` project. It is meant to be updated whenever the code changes so future work starts from a current architectural snapshot instead of re-discovering the app from scratch.

## Files

- `01-product-spec.md`: product scope, user flows, features, and known boundaries.
- `02-architecture.md`: app structure, rendering model, auth, storage strategy, and legacy notes.
- `03-routing-api.md`: page map and API contract inventory.
- `04-ui-components.md`: design system, shared components, dashboard shell, and page-level UI patterns.
- `05-data-models-integrations.md`: domain models, persistence behavior, backups, and external services.
- `06-maintenance-workflow.md`: rules for keeping this memory current after code changes.
- `07-change-log.md`: chronological summary of memory-relevant changes.

## How To Use This Memory

For me:

- Before making changes, read the relevant files in `PROJECT_MEMORY`.
- After making changes, update the affected memory files in the same task.
- Add a short entry to `07-change-log.md`.

For you:

- If you want work to start from the stored project context, say: `Read PROJECT_MEMORY first`.
- If you want the docs refreshed, say: `Audit the codebase and sync PROJECT_MEMORY`.
- If you want a feature area explained, ask for the specific file, for example: `Explain the booking flow from PROJECT_MEMORY`.

## Update Rule

Any meaningful code change should update:

1. The relevant memory file(s).
2. `07-change-log.md`.

That is the maintenance rule I will follow on future edits in this repo.
