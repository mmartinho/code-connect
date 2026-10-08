# Code Connect: Web

Frontend do Code Connect, uma SPA em React que consome a [API](../api/README.md).

Voltar para o [README principal](../../README.md).

## Stack

React 19, Vite, Tailwind CSS v4, React Router, Axios, oxlint, Vitest + Testing Library e Playwright + axe (acessibilidade).

## Rotas

| Rota | Acesso |
| --- | --- |
| `/feed` | Público (filtros na URL: `?q=&tags=&sort=`) |
| `/posts/:id` | Público |
| `/login`, `/cadastro` | Visitantes |
| `/publicar`, `/perfil` | Exigem login |

## Configuração

Copie `.env.example` para `.env`:

| Variável | Padrão |
| --- | --- |
| `VITE_API_URL` | `http://localhost:3000/v1` |

A API precisa estar no ar (`pnpm db:up` e `pnpm api:dev` na raiz).

## Estrutura

- `src/components/`: atomic design (`atoms` → `molecules` → `organisms` → `templates`); níveis inferiores nunca importam dos superiores
- `src/pages/`: páginas
- `src/services/`: cliente Axios e armazenamento do token
- `src/context/`: estado de autenticação
- Estilos com Tailwind; os tokens de design ficam no `@theme` de `src/index.css`
- Todo componente tem um teste ao lado (`Button.jsx` → `Button.test.jsx`)

## Scripts

```bash
pnpm --filter web dev          # ou pnpm web:dev na raiz
pnpm --filter web build
pnpm --filter web preview
pnpm --filter web lint
pnpm --filter web test         # Vitest
pnpm --filter web test:a11y    # Playwright + axe
pnpm --filter web lighthouse
```
