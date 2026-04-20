# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project snapshot

- Package: `@voxpelli/generate-favicon`
- Runtime: Node.js `^22.13.0 || >=24.0.0`
- Module system: **ESM only** (`"type": "module"`)
- Primary docs: [README.md](README.md)

## Mandatory validation

Run these before finalizing changes:

- `npm run check` — lint, typecheck, type coverage, installed-check, knip
- `npm run test:node` — node:test + c8 coverage
- `npm test` — full gate (`check` + tests)

If code changed, prefer `npm test` as the final verification.

## Architecture map

CLI flow is intentionally simple:

1. [`cli.js`](cli.js) — process entrypoint + top-level error handling
2. [`lib/main.js`](lib/main.js) — orchestration
3. [`lib/command.js`](lib/command.js) — argument parsing + validation
4. [`lib/action.js`](lib/action.js) — iterates sources and dispatches generation
5. [`lib/generate-favicon.js`](lib/generate-favicon.js) — Sharp/ICO file generation

Error classes live in [`lib/utils/errors.js`](lib/utils/errors.js).

## Testing conventions

See [README testing section](README.md#testing) for structure.

- `test/unit/` for parsing/orchestration
- `test/integration/` for filesystem/CLI behavior
- `node:test` + `node:assert/strict`
- Use temp dirs with `mkdtemp()` and clean up with `t.after()`

## Copilot Review checklist (basic)

When reviewing or preparing a PR:

- Ensure ESM imports/exports are preserved (no CommonJS)
- Verify `npm test` passes after the change
- Confirm tests are in correct scope (`unit/` vs `integration/`)
- Keep changes minimal and localized to the requested task
- Preserve CLI error semantics:
  - `InputError` → user-facing input issue
  - `ResultError` → result/processing issue
- Avoid introducing new dependencies unless required
- Do not edit generated or external folders unless explicitly asked:
  - `coverage/`
  - `node_modules/`

## Edit boundaries

Do not change these without explicit user request:

- CI/automation config under `.github/`
- Git hooks under `.husky/`
- Automation config like `renovate.json`
