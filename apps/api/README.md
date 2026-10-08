# Code Connect: API

API REST do Code Connect, versionada na URI (`/v1`). A documentação Swagger fica em `http://localhost:3000/docs`.

Voltar para o [README principal](../../README.md) · Ver também o [frontend](../web/README.md).

## Stack

NestJS 10, TypeORM + mysql2, MySQL 5.7, JWT (`@nestjs/jwt` + bcryptjs), class-validator, Swagger e Jest.

## Módulos

| Módulo | Responsabilidade |
| --- | --- |
| `auth` | Cadastro e login (JWT) |
| `users` | Usuários |
| `posts` | Posts, tags, curtidas, busca full-text e upload de thumbnail |
| `comments` | Comentários de um post, com um nível de resposta |

Principais endpoints:

- `GET /v1/posts?q=&tags=&sort=recent|popular&page=&limit=`: lista pública, com busca e filtros
- `POST /v1/posts`: cria post (autenticado, `multipart` com `thumbnail` opcional)
- `DELETE /v1/posts/:id`: remove (somente o autor)
- `GET|POST /v1/posts/:postId/comments`: comentários

Leituras são públicas; escritas exigem token JWT.

## Configuração

Copie `.env.example` para `.env`:

| Variável | Descrição |
| --- | --- |
| `PORT` | Porta da API (padrão 3000) |
| `JWT_SECRET` | Segredo de assinatura do JWT |
| `WEB_ORIGIN` | Origem do frontend liberada no CORS |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | Conexão MySQL (porta 3308 no Docker) |
| `DB_TEST_DATABASE` | Banco usado nos testes E2E |
| `API_PUBLIC_URL` | URL pública usada para montar os links das thumbnails |

## Banco de dados

```bash
pnpm db:up                                   # na raiz: sobe o MySQL
pnpm --filter api migration:generate src/database/migrations/<Nome>
pnpm --filter api migration:run
pnpm --filter api migration:revert
pnpm db:seed                                 # na raiz: dados de demonstração
```

O schema só muda por migrations (`synchronize` desligado); elas são aplicadas automaticamente ao iniciar a API. Novas migrations devem ser registradas em `src/database/typeorm.options.ts`.

## Uploads

Thumbnails (jpeg, png ou webp, até 2 MB, validadas pelos magic bytes) ficam em `apps/api/uploads/` e são servidas em `/uploads`.

## Scripts e testes

```bash
pnpm --filter api start:dev   # watch (ou pnpm api:dev na raiz)
pnpm --filter api build
pnpm --filter api test        # unitários, sem banco
pnpm --filter api test:e2e    # exige o MySQL no ar; usa code_connect_test
```
