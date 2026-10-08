# README do projeto: consolidar raiz + reescrever READMEs das apps

## Contexto

O [README.md](../README.md) da raiz tinha só duas linhas, e os READMEs de [apps/api](../apps/api/README.md) e [apps/web](../apps/web/README.md) eram o boilerplate dos templates (NestJS e Vite). Quem visita o repositório no GitHub precisa de um README raiz com **o que é, stack e como rodar**, com links clicáveis para os READMEs de cada app.

Decisões: reescrever os dois READMEs das apps; tudo em português.

## Arquivos

1. `README.md` (raiz): resumido.
2. `apps/api/README.md`: conteúdo específico do projeto.
3. `apps/web/README.md`: conteúdo específico do projeto.

## README raiz

- Título e descrição; tabela de stack; estrutura com links para as apps.
- Como rodar: `pnpm install`, copiar `.env.example`, `pnpm db:up`, `pnpm db:seed`, `pnpm api:dev`, `pnpm web:dev`; login de demo do seed; MySQL na porta 3308.
- Tabela de scripts; links para `apps/api/README.md`, `apps/web/README.md`, `plans/` e `CLAUDE.md`.

## apps/api/README.md

API REST `/v1` com Swagger em `/docs`; stack; módulos e endpoints principais; variáveis de ambiente; banco, migrations e seed; uploads; testes unitários e E2E; link para o README raiz.

## apps/web/README.md

SPA React; stack; rotas; `VITE_API_URL`; estrutura atomic design; scripts; link para o README raiz.

## Commit

`docs: rewrite project readmes` e push para `origin/main`.

## Verificação

Conferir comandos nos `package.json` e rotas em `apps/web/src/App.jsx`; checar que os links relativos resolvem.
