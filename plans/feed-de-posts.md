# Plan — Feed de Posts (Feed, Detalhes do Post, Publicar)

> Status: executed.

## Context
Code Connect so far only has auth (login, register, profile). This change adds the core of the product: a public **Feed** of posts, a **Post Details** page with comments, and the **Publicar** page, all built from the Figma file (desktop nodes Feed `155:3099`, Detalhes `155:3194`, Publicar `155:3124`). The backend gets the Posts, Tags, Likes and Comments models, migrations, server-side full-text search, and a seed of mock posts built from well-known gaffes by Dilma and Lula.

**Rules**
- Anonymous users can read the feed and post details, but cannot like or comment.
- Logged-in users can create posts, like posts and comment on any post, but can only delete their own posts.
- The side menu shows "Sair" or "Login" depending on the session.

**Decisions made with you**
- The Publicar page is in scope, including the "Carregar imagem" upload.
- The feed tabs are **Recentes** (`?sort=recent`) and **Populares** (`?sort=popular`, by likes).

**Decisions I made**
- The design's "code" icon (Figma "Aprovar") is the **like** action.
- "Share" copies the post URL to the clipboard. It has no counter; nothing is persisted.
- Users have no username or avatar, so authors show their `name` and an initials avatar.
- Comments have one level of replies, as in the design.

---

## Backend (`apps/api`)

### Data model: one migration, `src/database/migrations/<ts>-CreatePosts.ts`
Raw SQL in the style of `1791320000000-CreateUsers.ts`, all tables InnoDB utf8mb4:
- `posts`: `id` varchar(36) PK, `author_id` FK→users ON DELETE CASCADE, `title` varchar(120), `body` text, `code` text NULL, `thumbnail_path` varchar(255) NULL, `likes_count` int DEFAULT 0 (denormalized for `?sort=popular`), `comments_count` int DEFAULT 0, `created_at`, `updated_at`.
  - `FULLTEXT INDEX FT_posts_search (title, body)`, created in a separate statement.
  - `INDEX (created_at)` and `INDEX (likes_count)`.
- `tags`: `id`, `name` varchar(40) UNIQUE. `post_tags`: (`post_id`, `tag_id`) composite PK, both FKs ON DELETE CASCADE.
- `post_likes`: (`post_id`, `user_id`) composite PK, FKs cascade, `created_at`. The PK makes liking idempotent.
- `comments`: `id`, `post_id` FK cascade, `author_id` FK cascade, `parent_id` FK→comments NULL cascade (replies), `body` varchar(1000), `created_at`.

Entities go under `src/posts/entities/` (`Post`, `Tag`, `PostLike`) and `src/comments/entities/Comment`. Register them, and the migration, by hand in `src/database/typeorm.options.ts`.

### Auth helpers (missing today)
- `src/auth/optional-auth.guard.ts`: same verification as `auth.guard.ts`, but it never throws. With a valid token it sets `request.user`; otherwise it continues as anonymous. Extract the header-parsing logic from `AuthGuard` into a shared function so both guards reuse it.
- `src/auth/current-user.decorator.ts`: `@CurrentUser()` returns `request.user?.sub` (or `undefined`).

### Endpoints (all under `/v1`, DTOs validated with class-validator, invalid input returns 422 via the existing global pipe)
| Method & path | Auth | Result |
|---|---|---|
| `GET /posts?q=&tags=react,front-end&sort=recent\|popular&page=1&limit=10` | optional | 200 `{ data: PostSummary[], meta: {page, limit, total}, links: {self, next, prev} }` |
| `GET /posts/:id` | optional | 200 PostDetail (adds `code`, `likedByMe`, `canDelete`); 404 if not found |
| `POST /posts` (multipart: `title`, `body`, `code?`, `tags[]`, `thumbnail?` file) | required | 201 + `Location: /v1/posts/:id` |
| `DELETE /posts/:id` | required | 204; 403 if not the author; 404 if not found |
| `PUT /posts/:id/likes/me` / `DELETE /posts/:id/likes/me` | required | 204 (idempotent); updates `likes_count` in a transaction |
| `GET /posts/:id/comments` | optional | 200 top-level comments with nested `replies` |
| `POST /posts/:id/comments` (`body`, `parentId?`) | required | 201 + Location; 422 if `parentId` is itself a reply or belongs to another post |
| `GET /tags?sort=popular&limit=10` | public | 200 most-used tags, used by the search/Publicar suggestions |

- **PostSummary:** `id, title, excerpt, thumbnailUrl|null, tags[], author{id,name}, likesCount, commentsCount, likedByMe, createdAt, links{self, comments}`.
- **Response mapping:** static `fromEntity` mappers on response DTOs, the same pattern as `UserResponseDto`. Entities are never returned directly.
- **Caching headers:** `Cache-Control: no-store` on GETs when a token is present, otherwise `public, max-age=30`.
- **Full-text search:** in `PostsService.findAll`, using QueryBuilder.
  - Sanitize `q` by stripping boolean operators, split it into terms and add a `*` suffix to each term.
  - Query with `MATCH(p.title, p.body) AGAINST(:q IN BOOLEAN MODE)`.
  - Join `post_tags`/`tags` for the tag filter and order by `created_at` or `likes_count`.
  - `likedByMe` is computed with one extra query over the page's ids.
  - Caveat: MySQL 5.7's `innodb_ft_min_token_size=3` drops shorter terms. Document this in a comment rather than changing the server config.
- **Thumbnail upload:** `FileInterceptor('thumbnail')` with multer disk storage into `apps/api/uploads/` (gitignored). `ParseFilePipe` accepts jpeg/png/webp up to 2 MB; anything else returns 422. Serve the folder statically at `/uploads` with `app.useStaticAssets` in `main.ts`. `thumbnailUrl` is built from `API_PUBLIC_URL` (new env var with a default; add it to `.env.example`). Deleting a post also removes its file, best-effort.
- **Modules:** `PostsModule` (controller, service, `TagsController`) and `CommentsModule`, both imported in `app.module.ts`. `@nestjs/swagger` decorators follow the existing controllers.

### Seed
- `src/database/seeds/seed.ts` runs via `"seed": "ts-node src/database/seeds/run-seed.ts"` in the api package and `"db:seed": "pnpm --filter api seed"` at the root. It uses the existing `data-source.ts`.
- **Idempotent:** it deletes seeded data (users with `@seed.codeconnect.dev` emails cascade to their posts) and recreates it.
- **Users:** five seed users with the names from the design (Julio, Marcia, Gabriel Luz, Marcela Lins, Ana) and a known password. Document the password in the README section of `CLAUDE.md`.
- **Posts:** about 14 posts. The title is the quote; the body gives the president, year and occasion.
  - Use only well-documented quotes, and skip any that are offensive to groups. Examples:
    - Dilma: "não vamos colocar meta… quando atingirmos a meta, vamos dobrar a meta" (2015); "saudar a mandioca" (2015); "mulheres sapiens" and the ball speech (2015); "estocar vento" (2015); "o meio ambiente é uma ameaça ao desenvolvimento sustentável" (2010); the "cachorro atrás de cada criança" speech (2015).
    - Lula: "tsunami… marolinha" (2008); "crise causada por gente branca de olhos azuis" (2009); "a saúde no Brasil não está longe de atingir a perfeição" (2006).
  - Each post gets tech-humour tags (e.g. `meta`, `vento`, `front-end`, `react`), a code snippet that riffs on the quote (e.g. `const meta = () => meta() * 2`), and random likes and comments with replies from the other seed users.
  - About half the posts get a thumbnail. Download the Figma "code editor" images into `src/database/seeds/assets/`; the seed copies them into `uploads/`. The rest have none, so they show the placeholder.

### API tests
- **Unit tests** (`*.spec.ts`), mocking the repositories with jest. The QueryBuilder rules out reusing `InMemoryUsersRepository`:
  - the delete ownership check (403 vs 204);
  - like idempotency;
  - the reply-depth rule in comments;
  - the search-term sanitizer as a pure function in `src/posts/search-query.ts`;
  - `OptionalAuthGuard`, modelled on `auth.guard.spec.ts`;
  - the DTO mappers.
- **E2E** (`test/posts.e2e-spec.ts`): anonymous GET feed and detail; 401 on like/comment/create without a token; create with a thumbnail returns 201 + Location; FTS `?q=` returns the matching post; a `?tags=` filter; deleting someone else's post returns 403 and your own returns 204; like then unlike updates the counts.
  - Update cleanup in `app.e2e-spec.ts` too: delete child tables first (comments, post_likes, post_tags, posts, tags) before users, because `TRUNCATE users` fails once foreign keys exist.

---

## Frontend (`apps/web`)

Atomic design, Tailwind v4 tokens in `src/index.css`, a test next to every component. Add the design colours that are missing as theme tokens: `--color-light: #bcbcbc` and `--color-grafite` (= page). Use the existing `muted`, `surface`, `offwhite` and `brand` tokens otherwise.

### Services
- `src/services/posts.js`: `listPosts(params)`, `getPost(id)`, `createPost(formData)`, `deletePost(id)`, `likePost(id)`/`unlikePost(id)`, `listComments(id)`, `createComment(id, {body, parentId})`, `listTags()`. All use the existing axios `api` instance, so the token is attached automatically.

### Components (reuse first)
- **Reuse:** `Logo`, `Button`, `Input`, `Label`, `FormField`, `Alert`, `Heading`, `TextLink`, `Icon`.
- **Extend `Icon`** with Material paths: `feed`, `account_circle`, `info`, `logout`, `login`, `search`, `code`, `share`, `chat`, `close`, `upload`, `publish`, `delete`.
- **Extend `Button`** with an `variant="outline"` (border-brand, used by Publicar in the menu and by Descartar). Keep the current solid variant as the default.

**Atoms (new)**
- `Tag`: `variant` `active` (with × button), `suggestion` or `static`; optional `onClick`/`onRemove`.
- `Avatar`: initials circle, 32px.
- `Textarea`.
- `Tab`: `active` state, green and underlined.

**Molecules**
- `SearchBox`: search icon plus an input; submits on Enter or a 300 ms debounce.
- `NavItem`: icon plus label, `active` state, rendered as a `NavLink` or a button.
- `PostActions`: like, share and comment, each with a count. Like and comment are disabled with a "Faça login para curtir" tooltip and `aria-disabled` when anonymous. Like is optimistic.
- `AuthorBadge`: `Avatar` plus name.
- `PostThumbnail`: the **placeholder solution**.
  - Inside the grey `card_code_editor` frame it renders `<img>` when `thumbnailUrl` exists.
  - When there is no URL, or `onError` fires, it renders a stylized "code editor" mock: a dark `bg-surface` panel with a faux title bar, the `code` icon and the post's first code lines (or the `Logo` symbol). It keeps the same 240px (card) / 320px (detail) geometry, so the layout never shifts.
- `CommentItem`: author, body, "Responder" and the "Ver/Ocultar respostas" toggle.
- `TagInput`: Enter or comma adds a tag; renders removable `Tag`s plus suggestions.

**Organisms**
- `Sidebar`: `Logo`, the "Publicar" outline button (`/publicar`, or `/login` when anonymous), and NavItems Feed/Perfil/Sobre nós plus a last item that reads **"Sair"** (logout → `/feed`) or **"Login"** (→ `/login`) from `useAuth().status`. On mobile it becomes the bottom bar from Figma "Menu mobile" (`169:1999`); fetch that node during implementation.
- `PostCard`: feed card, 486px max, the whole card links to `/posts/:id`.
- `PostList`: responsive grid with loading, empty and error states, and a "Carregar mais" button.
- `FeedFilters`: `SearchBox`, active chips (search term plus selected tags, each removable), and "Limpar tudo".
- `PostDetail`: large card, "Código:" block (Roboto Mono; add the font or fall back to `ui-monospace`), and a "Excluir" button shown only when `canDelete`, with a confirm dialog.
- `CommentSection`: list plus a new-comment form for logged-in users; anonymous users see "Faça login para comentar" with a link instead.
- `PostForm`: Publicar layout, with image preview through `PostThumbnail`, "Carregar imagem", filename with ×, Nome do projeto, Descrição, Código, Tags (`TagInput`), and Descartar/Publicar.

**Template (shared layout)**
- `AppTemplate`: page background, `max-w-[1200px]` container, `Sidebar` on the left, `children` on the right. Every page in the app area, current and future (Perfil, Sobre nós), uses it.
- `ProfilePage` moves onto `AppTemplate` too, so the layout is actually reused.

**Pages and routes (`App.jsx`)**
- `/` → `/feed`.
- `/feed`: `FeedPage`, public. Filters and tab live in the URL search params (`?q=&tags=&sort=`).
- `/posts/:id`: `PostDetailPage`, public.
- `/publicar`: `NewPostPage`, inside `RequireAuth`. On success it navigates to the new post.
- After login/register, redirect to `/feed` instead of `/perfil`, in `LoginPage`/`RegisterPage` and `GuestOnly`.
- Each page sets `<title>`, the same pattern as the current pages.

### Web tests
Every new or changed component, plus `posts.js`, gets a `*.test.jsx`/`*.test.js` (render, variants, main interaction). Key cases:
- `Sidebar` shows "Sair" vs "Login" and logs out.
- `PostThumbnail` falls back to the placeholder when there is no URL and when the image errors.
- `PostActions` is disabled when anonymous.
- `PostDetail` shows "Excluir" only when `canDelete`.
- `FeedPage` turns search and tab changes into the right `listPosts` params.

Add an a11y e2e entry for `/feed` in `e2e/accessibility.spec.js`.

---

## Docs and commits
- **`CLAUDE.md`:** fix the stale "Tailwind is not installed" note; document `pnpm db:seed`, the seed credentials, `uploads/` and `API_PUBLIC_URL`.
- **Suggested Conventional Commits:**
  1. `feat(api): add posts, tags, likes and comments with full-text search`
  2. `feat(api): add seed with mock posts`
  3. `feat(web): add app layout with session-aware sidebar`
  4. `feat(web): add feed, post details and publish pages`
  5. `docs: update claude.md`

## Verification
1. `pnpm db:up` → `pnpm api:dev`: migrations apply on boot; check that `SHOW INDEX FROM posts` lists the FULLTEXT index.
2. `pnpm db:seed` → `GET /v1/posts?q=meta` returns the "dobrar a meta" post; `?sort=popular` is ordered by likes.
3. `pnpm api:test` and `pnpm --filter api test:e2e` both pass. `pnpm api:lint`.
4. `pnpm web:test`, `pnpm web:lint`, `pnpm web:build`.
5. Manual check with `pnpm web:dev`, comparing against the Figma screenshots:
   - **Anonymous:** the feed loads; posts with no thumbnail show the placeholder; search and tag chips filter; like and comment are disabled; the menu says "Login".
   - **Logged in:** the menu says "Sair"; like and unlike update the count; comment and reply work; Publicar with an image creates a post and redirects to it; "Excluir" appears only on your own posts and returns you to the feed.
6. `pnpm web:a11y` for the feed route.
