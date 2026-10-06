# Backend: users registration, JWT login and current user

## Context
`apps/api` is still the Nest 10 starter (`AppController` "Hello World"). The web app already has login/register pages and needs a backend. We'll add 3 endpoints — register (name, email, password), login returning a JWT, and "current user" protected by an `AuthGuard` written as in the Nest docs (Authentication chapter, `CanActivate` + `JwtService.verifyAsync`). Storage is an in-memory array (no ORM/DB). Swagger documents inputs and outputs. CLAUDE.md REST rules apply (plural nouns, no verbs, correct status codes, DTOs, `/v1` versioning, never expose entities).

## Endpoints
| Method | Path | Auth | Success | Errors |
|---|---|---|---|---|
| POST | `/v1/users` | — | `201` + `Location: /v1/users/{id}` + `UserResponseDto` | `409` email taken, `422` validation, `400` malformed JSON |
| POST | `/v1/auth/tokens` (login; resource = token, no verb) | — | `201` + `{ accessToken, tokenType: "Bearer", expiresIn }` | `401` bad credentials, `422` |
| GET | `/v1/users/me` | Bearer | `200` + `UserResponseDto`, `Cache-Control: no-store` | `401` missing/invalid token or user no longer exists |

`UserResponseDto`: `{ id, name, email, createdAt }` (never the password hash).

## Dependencies (`pnpm --filter api add ...`)
`@nestjs/jwt@^10`, `@nestjs/swagger@^8`, `class-validator`, `class-transformer`, `bcryptjs` (+ `-D @types/bcryptjs`). `bcryptjs` instead of `bcrypt` to avoid native builds on Windows.

## Files
**Remove** the scaffold: `src/app.controller.ts`, `app.service.ts`, `app.controller.spec.ts`.

**`src/main.ts`**
- `app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })`
- global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, errorHttpStatusCode: 422 })`
- `app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173' })`
- Swagger: `DocumentBuilder` (title "Code Connect API", `addBearerAuth()`), served at `/docs`.
- Extract the pipe/versioning setup into `src/setup-app.ts` (`setupApp(app)`) so e2e tests use the same config.

**`src/users/`**
- `entities/user.entity.ts` — internal `User { id, name, email, passwordHash, createdAt }`.
- `users.service.ts` — `private readonly users: User[] = []`; `create({name,email,password})` (normalizes email to trim+lowercase, throws `ConflictException` if exists, hashes with `bcryptjs`, id via `crypto.randomUUID()`), `findByEmail`, `findById`. Exported for `AuthModule`.
- `dto/create-user.dto.ts` — `name` (`IsString`, `IsNotEmpty`, `MaxLength(100)`), `email` (`IsEmail`), `password` (`IsString`, `MinLength(8)`, `MaxLength(72)` — bcrypt limit); all with `@ApiProperty` examples.
- `dto/user-response.dto.ts` — with static `fromEntity(user)`.
- `users.controller.ts` — `@Controller('users')`, `@ApiTags('users')`:
  - `@Post()` `@HttpCode(201)`, sets `Location` via `@Res({ passthrough: true })`.
  - `@Get('me')` `@UseGuards(AuthGuard)` `@ApiBearerAuth()`, `@Header('Cache-Control','no-store')`; loads user by `req.user.sub`, `UnauthorizedException` if missing.
  - Swagger response decorators (`@ApiCreatedResponse`, `@ApiConflictResponse`, `@ApiUnprocessableEntityResponse`, `@ApiUnauthorizedResponse`, …) typed with DTOs.
- `users.module.ts` — provides/exports `UsersService`. The `AuthGuard` only depends on `JwtService`, which is available everywhere because `JwtModule` is registered with `global: true`, so there's no circular import between `UsersModule` and `AuthModule`.

**`src/auth/`**
- `auth.constants.ts` — `jwtSecret = process.env.JWT_SECRET ?? 'dev-only-secret'`, `jwtExpiresIn = 3600`.
- `auth.module.ts` — `JwtModule.register({ global: true, secret, signOptions: { expiresIn } })` (doc pattern), imports `UsersModule`.
- `auth.service.ts` — `signIn(email, password)`: find user, `bcrypt.compare`; on any failure `UnauthorizedException('Invalid credentials')` (same message for unknown email and wrong password); returns `{ accessToken: await jwtService.signAsync({ sub: id, email }), tokenType: 'Bearer', expiresIn }`.
- `auth.guard.ts` — exactly the docs pattern: `extractTokenFromHeader` (`Bearer` scheme), `verifyAsync`, attach payload to `request['user']`, else `UnauthorizedException`.
- `dto/create-token.dto.ts` (`email`, `password`), `dto/token-response.dto.ts`.
- `auth.controller.ts` — `@Controller('auth')`, `@Post('tokens')` `@HttpCode(201)`, Swagger decorators.

**`src/common/dto/error-response.dto.ts`** — `{ statusCode, message: string | string[], error }` (Nest's default exception shape), used only in Swagger response types for consistency.

**`src/app.module.ts`** — `imports: [UsersModule, AuthModule]`, no controllers.

**`apps/api/.env.example`** — `PORT`, `JWT_SECRET`, `WEB_ORIGIN` (documentation only; read via `process.env`, no `@nestjs/config` yet).

## Tests
Unit (`*.spec.ts` next to source):
- `users.service.spec.ts` — creates user with hashed password, normalizes email, 409 on duplicate, finders.
- `auth.service.spec.ts` — returns token for valid creds; 401 for unknown email / wrong password.
- `auth.guard.spec.ts` — allows valid Bearer token and sets `request.user`; rejects missing header, wrong scheme, invalid token.
- `users.controller.spec.ts` / `auth.controller.spec.ts` — delegate to services and map to DTOs (no hash leaked).

E2E (`test/app.e2e-spec.ts`, rewritten; uses `setupApp`): register → 201 + Location; duplicate → 409; invalid body → 422; login wrong password → 401; login → token; `GET /v1/users/me` with token → 200 without `passwordHash`; without/invalid token → 401.

## Verification
1. `pnpm api:test` and `pnpm --filter api test:e2e` pass.
2. `pnpm --filter api build` compiles; `pnpm --filter api exec eslint "src/**/*.ts" "test/**/*.ts"` clean (without `--fix` first, to see issues).
3. `pnpm api:dev`, open `http://localhost:3000/docs`: the 3 endpoints show request/response schemas; use "Authorize" with the token from `/v1/auth/tokens` to call `/v1/users/me`.

## Commit
`feat(api): add user registration, jwt login and current user endpoints` (Conventional Commits).
