# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

pnpm workspaces monorepo (`pnpm-workspace.yaml` → `apps/*`). Use `pnpm`, not npm/yarn.

- `apps/api` — NestJS 10 backend (TypeScript, Jest, ESLint + Prettier). Listens on `PORT` or 3000.
- `apps/web` — React 19 frontend (plain JSX, Vite, oxlint). Not yet connected to the API; no proxy is configured in `vite.config.js`.

Both apps are currently near-starter scaffolds (API has only `AppModule`/controller/service; web has `App.jsx`).

## Commands

Run from the repo root; the root scripts proxy to each app via `pnpm --filter`.

- `pnpm dev` — run `dev` in all apps in parallel (note: only `web` defines `dev`; the API's watch script is `start:dev`, so use `pnpm api:dev` for it)
- `pnpm web:dev` / `web:build` / `web:lint` / `web:preview`
- `pnpm api:dev` (watch) / `api:start` / `api:build` / `api:lint` / `api:test`
- `pnpm build`, `pnpm test` — across all workspaces

Single API test (Jest, `rootDir` is `src`, matches `*.spec.ts`):

```
pnpm --filter api exec jest app.controller.spec.ts
pnpm --filter api exec jest -t "test name"
```

E2E tests: `pnpm --filter api test:e2e` (config in `apps/api/test/jest-e2e.json`).

Note: `api:lint` runs ESLint with `--fix`, so it modifies files.
## Frontend conventions (`apps/web`)

- **Atomic design.** Organize components under `src/components/` by level: `atoms/` (button, input, icon), `molecules/` (atoms combined into a single-purpose unit, e.g. form field), `organisms/` (self-contained UI sections, e.g. header, post list), `templates/` (page layouts without real data), and pages under `src/pages/`. Lower levels never import from higher ones (atoms ← molecules ← organisms ← templates ← pages).
- **Tailwind CSS** is the styling approach. Style with utility classes in JSX; avoid ad-hoc CSS files and inline `style` props. Tailwind is not installed yet — add it (with its Vite plugin) when the first styled component is created.
- **Every component must have a test** covering its essential use (renders, main props/variants, primary interaction). Keep the test next to the component (`Button.jsx` → `Button.test.jsx`). A component is not done until its test exists and passes.

## Backend conventions (`apps/api`)

Follow REST principles strictly:

- **Resources, not actions.** URIs are plural nouns (`/posts`, `/posts/:id`, `/posts/:id/comments`); no verbs in paths. Use lowercase, hyphenated segments and limit nesting to what expresses real ownership.
- **HTTP methods carry the semantics.** `GET` read (safe, idempotent, no side effects), `POST` create, `PUT` full replace (idempotent), `PATCH` partial update, `DELETE` remove (idempotent).
- **Correct status codes.** `200` OK, `201 Created` (with a `Location` header) on create, `204 No Content` on delete/empty responses, `400` malformed input, `401`/`403` authn/authz, `404` missing resource, `409` conflict, `422` validation failure. Never return `200` with an error body. Use Nest's `@HttpCode` and exception filters to enforce this.
- **Stateless.** No server-side session state; each request carries what's needed to process it (e.g. a token).
- **Consistent representations.** JSON in/out with a consistent error shape. Validate input with DTOs (`class-validator`) and never expose internal entities directly.
- **Collections.** Paginate, filter and sort via query parameters (`?page=`, `?limit=`, `?sort=`), not path segments.
- **Versioning.** Version the API in the URI prefix (`/v1/...`) or via a consistent mechanism chosen project-wide.
- **Cacheability and discoverability.** Set appropriate cache headers on `GET`s where relevant, and include links to related resources when it aids clients (HATEOAS where practical).

## Git conventions (both apps)

Use [Conventional Commits](https://www.conventionalcommits.org/) for every commit: `<type>(<optional scope>): <description>`.

- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Scope is the app or area, e.g. `feat(api): add posts endpoint`, `fix(web): correct button focus style`.
- Description in the imperative mood, lowercase, no trailing period. Mark breaking changes with `!` after the type/scope (`feat(api)!: ...`) and/or a `BREAKING CHANGE:` footer.
