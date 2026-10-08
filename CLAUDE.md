# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

pnpm workspaces monorepo (`pnpm-workspace.yaml` → `apps/*`). Use `pnpm`, not npm/yarn.

- `apps/api` — NestJS 10 backend (TypeScript, Jest, ESLint + Prettier). Listens on `PORT` or 3000.
- `apps/web` — React 19 frontend (plain JSX, Vite, oxlint). Talks to the API through Axios (`src/services/api.js`, base URL from `VITE_API_URL`, default `http://localhost:3000/v1`; see `apps/web/.env.example`). Auth state lives in `src/context/AuthContext.jsx` and the JWT is kept in `localStorage`/`sessionStorage` (`src/services/tokenStorage.js`). To use it locally run `pnpm db:up`, `pnpm api:dev` and `pnpm web:dev` together; the API allows the Vite origin via `WEB_ORIGIN`.

- `docker-compose.yml` (root) — MySQL 5.7 on host port `3308` (WAMP usually holds 3306/3307), data in the named volume `mysql-data`. `docker/mysql/init/` creates the `code_connect_test` database on first start.

The API persists data in MySQL through **TypeORM** (`@nestjs/typeorm` + `mysql2`). Connection options live in `apps/api/src/database/typeorm.options.ts` (read from `DB_*` env vars, see `apps/api/.env.example`). `synchronize` is off: schema changes go through migrations in `apps/api/src/database/migrations/`, registered explicitly in the options and applied automatically on boot (`migrationsRun`).

### Posts feed (feature map)

- **API** (`apps/api/src`): `posts/` (posts, tags, likes; `GET /v1/posts?q=&tags=&sort=recent|popular&page=&limit=`, full-text search through `MATCH … AGAINST` on a FULLTEXT index over title+body, see `posts/search-query.ts`), `comments/` (`/v1/posts/:postId/comments`, one reply level). Reads are public through `auth/optional-auth.guard.ts` (valid token only adds `likedByMe`/`canDelete`); writes use `AuthGuard`; only the author can `DELETE` a post. `@CurrentUser()` returns the JWT `sub`.
- **Uploads:** thumbnails are sent as multipart (`thumbnail`, jpeg/png/webp, ≤ 2 MB, checked by magic bytes in `posts/thumbnail.validator.ts`), stored in `apps/api/uploads/` (git-ignored) and served at `/uploads`. `API_PUBLIC_URL` builds the absolute URLs.
- **E2E cleanup:** tests delete with `DELETE FROM users` (cascade); `TRUNCATE users` fails now that tables reference it.
- **Web** (`apps/web/src`): pages `/feed` and `/posts/:id` are public, `/publicar` and `/perfil` need login. Pages share `templates/AppTemplate` (menu `organisms/Sidebar`, whose last item is "Sair"/"Login" depending on the session). Posts without a thumbnail render the code-editor placeholder in `molecules/PostThumbnail`. Feed filters live in the URL (`?q=&tags=&sort=`).

## Commands

Run from the repo root; the root scripts proxy to each app via `pnpm --filter`.

- `pnpm dev` — run `dev` in all apps in parallel (note: only `web` defines `dev`; the API's watch script is `start:dev`, so use `pnpm api:dev` for it)
- `pnpm web:dev` / `web:build` / `web:lint` / `web:preview`
- `pnpm api:dev` (watch) / `api:start` / `api:build` / `api:lint` / `api:test`
- `pnpm build`, `pnpm test` — across all workspaces
- `pnpm db:up` / `pnpm db:down` — start/stop MySQL (`docker compose down -v` also wipes the data)
- `pnpm --filter api migration:generate src/database/migrations/<Name>` / `migration:run` / `migration:revert` — TypeORM CLI (reads `apps/api/.env`); register new migrations in `typeorm.options.ts`
- `pnpm db:seed` — recreate the demo data (idempotent): 5 users (`julio@seed.codeconnect.dev`, `marcia@…`, `gabriel@…`, `marcela@…`, `ana@…`, all with password `senha-segura-123`), 8 posts with tags, likes and comments, and thumbnails copied from `apps/api/src/database/seeds/assets/` to `apps/api/uploads/`. Only data owned by `@seed.codeconnect.dev` users is removed on re-run.

Single API test (Jest, `rootDir` is `src`, matches `*.spec.ts`):

```
pnpm --filter api exec jest app.controller.spec.ts
pnpm --filter api exec jest -t "test name"
```

E2E tests: `pnpm --filter api test:e2e` (config in `apps/api/test/jest-e2e.json`). They need the MySQL container running and use the `code_connect_test` database (forced by `test/setup-env.ts`), clearing tables before the suite. Unit tests don't touch the database: they use `src/users/testing/in-memory-users.repository.ts` in place of `Repository<User>`.

Note: `api:lint` runs ESLint with `--fix`, so it modifies files.
## Frontend conventions (`apps/web`)

- **Atomic design.** Organize components under `src/components/` by level: `atoms/` (button, input, icon), `molecules/` (atoms combined into a single-purpose unit, e.g. form field), `organisms/` (self-contained UI sections, e.g. header, post list), `templates/` (page layouts without real data), and pages under `src/pages/`. Lower levels never import from higher ones (atoms ← molecules ← organisms ← templates ← pages).
- **Tailwind CSS** is the styling approach. Style with utility classes in JSX; avoid ad-hoc CSS files and inline `style` props. Tailwind v4 is installed (`@tailwindcss/vite`); design tokens live in the `@theme` block of `src/index.css` (`brand`, `page`, `surface`, `muted`, `light`, `offwhite`…), so use them instead of hex values.
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
