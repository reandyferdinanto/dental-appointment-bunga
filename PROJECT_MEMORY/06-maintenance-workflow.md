# Memory Maintenance Workflow

Last updated: 2026-03-28

## Rule

Whenever code changes in this repository, update the project memory in the same task.

Minimum required update:

1. Update the relevant file in `PROJECT_MEMORY`.
2. Append a short note to `07-change-log.md`.

## Which File To Update

- Feature behavior changed:
  - update `01-product-spec.md`
- Routing, auth, storage, rendering, or system design changed:
  - update `02-architecture.md`
- New page, route, API shape, or flow changed:
  - update `03-routing-api.md`
- Shared component, styling system, or page UI pattern changed:
  - update `04-ui-components.md`
- Data model, persistence path, integration, or schema changed:
  - update `05-data-models-integrations.md`

## Change Log Format

Each entry in `07-change-log.md` should include:

- date
- area
- what changed
- which memory files were updated

## Sync Audit Workflow

If memory may be stale:

1. inspect affected code
2. update the corresponding memory file
3. update `07-change-log.md`
4. refresh the `Last updated` line in touched memory files

## Practical Prompt To Reuse

Use one of these prompts:

- `Read PROJECT_MEMORY first, then make the change and update the memory too.`
- `Audit the repo and sync PROJECT_MEMORY with the current codebase.`
- `Use PROJECT_MEMORY as the source of context, then update it after editing.`
