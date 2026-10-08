# Code Connect

Rede social para desenvolvedores compartilharem projetos e trechos de código: feed com busca por texto e tags, curtidas, comentários e publicação com thumbnail. Projeto didático (monorepo pnpm) do curso da Alura sobre uso de IA no fluxo real de desenvolvimento.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend ([`apps/web`](apps/web/README.md)) | React 19, Vite, Tailwind CSS v4, React Router, Axios, Vitest + Testing Library, Playwright + axe |
| Backend ([`apps/api`](apps/api/README.md)) | NestJS 10, TypeORM, MySQL 5.7, JWT, Swagger, Jest |
| Infra | pnpm workspaces, Docker Compose (MySQL) |

## Como rodar

Pré-requisitos: Node.js, [pnpm](https://pnpm.io) e Docker.

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
pnpm db:up        # MySQL na porta 3308
pnpm db:seed      # opcional: dados de demonstração
pnpm api:dev      # API em http://localhost:3000 (Swagger em /docs)
pnpm web:dev      # Web em http://localhost:5173
```

Com o seed, é possível entrar com `julio@seed.codeconnect.dev` e a senha `senha-segura-123`.

## Scripts principais

Executados na raiz:

| Script | O que faz |
| --- | --- |
| `pnpm api:dev` / `pnpm web:dev` | Sobe a API (watch) / o frontend |
| `pnpm build` | Build de todas as apps |
| `pnpm test` | Testes de todas as apps |
| `pnpm api:lint` / `pnpm web:lint` | Lint (o da API aplica `--fix`) |
| `pnpm db:up` / `pnpm db:down` | Inicia / para o MySQL |
| `pnpm db:seed` | Recria os dados de demonstração |

## Saiba mais

- [apps/api/README.md](apps/api/README.md): API, variáveis de ambiente, banco, migrations e testes
- [apps/web/README.md](apps/web/README.md): frontend, rotas, estrutura de componentes e testes
- [plans/](plans/): planos de cada funcionalidade
- [CLAUDE.md](CLAUDE.md): convenções do projeto
