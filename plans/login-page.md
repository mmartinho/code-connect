# Plano — Página de Login (Code Connect) · documentado a partir da implementação

## Contexto

Primeira tela real do `apps/web`: a página de **Login**, seguindo o layout fornecido (card escuro centralizado, banner à esquerda, formulário à direita, login social e link para cadastro, formas da marca ao fundo).
Requisitos:
- Logos sociais: `public/github.png`, `public/gmail.png` (as imagens já trazem o rótulo "Github"/"Gmail").
- Banner: `public/banner-login.png`.
- **Atomic design** (CLAUDE.md): atoms ← molecules ← organisms ← templates ← pages.
- **Reuso para Cadastro**: mesmo layout, mas banner e campos diferentes.
- **Tailwind CSS** (instalar com o plugin do Vite no primeiro componente) e **um teste por componente**.

Este plano foi escrito depois da implementação (a etapa de planejamento tinha sido pulada). Ele registra as decisões tomadas e o que ainda falta.

## 1. Infraestrutura

| Arquivo | Mudança |
|---|---|
| `apps/web/package.json` | deps: `react-router`; devDeps: `tailwindcss`, `@tailwindcss/vite`, `vitest`, `jsdom`, `@testing-library/{react,jest-dom,user-event}`; scripts `test` / `test:watch` |
| `apps/web/vite.config.js` | plugins `react()` + `tailwindcss()`; bloco `test` (jsdom, globals, `setupFiles`) |
| `apps/web/src/test/setup.js` | `import '@testing-library/jest-dom/vitest'` |
| `apps/web/src/index.css` | `@import 'tailwindcss'` + tokens no `@theme`: `brand #81fe88`, `page #01080e`, `surface #171d1f`, `shape #0a1a20`, `offwhite #e1e1e1`, `muted #888888`, `font-sans: Prompt` |
| `apps/web/index.html` | `lang="pt-BR"`, fonte Prompt (Google Fonts 400/500/600), título "Code Connect" |
| `apps/web/src/App.jsx` | `BrowserRouter`: `/` → redireciona para `/login`; `/login` → `LoginPage` |
| `package.json` (raiz) | script proxy para os testes do web |

## 2. Componentes (`apps/web/src/components/`)

### Atoms
- `Button`: CTA verde (`bg-brand`), largura total, aceita `icon` depois do texto; `type="button"` por padrão.
- `Input`: campo cinza (`bg-muted`) com outline de foco na cor da marca.
- `Label`: rótulo `text-lg text-offwhite`.
- `Checkbox`: checkbox estilizado (`appearance-none` + check em SVG via `peer-checked`), label clicável, id por `useId`.
- `Heading`: título polimórfico (`as`, padrão `h1`).
- `TextLink`: `Link` do react-router com variantes `default` (sublinhado, "Esqueci a senha") e `accent` (verde, "Crie seu cadastro!").
- `Icon`: SVGs inline (`arrow-right`, `clipboard`); decorativo por padrão, `role="img"` quando recebe `title`.
- `Divider`: linhas horizontais com texto opcional no meio.
- `SocialButton`: botão com a imagem do provedor e `aria-label="Entrar com {name}"`.
- `BrandShape`: SVG dos dois elos da marca, usado como decoração de fundo (`aria-hidden`).

### Molecules
- `FormField`: `Label` + `Input` ligados por `useId`; repassa as props do input.
- `SocialLogin`: `Divider` ("ou entre com outras contas") + lista de provedores (`github`, `gmail`) → `onSelect(providerId)`.
- `AuthSwitchPrompt`: pergunta + `TextLink accent` + ícone opcional ("Ainda não tem conta? / Crie seu cadastro!").

### Organisms
- `LoginForm`: estado controlado (`login`, `password`, `remember`); campos obrigatórios; checkbox "Lembrar-me" + link `/esqueci-a-senha`; submit chama `onSubmit({ login, password, remember })`.

### Templates
- `AuthTemplate({ bannerSrc, bannerAlt, title, subtitle, children, footer })`: fundo `bg-page` com dois `BrandShape`, card `bg-surface` (max 994px, `rounded-[32px]`), banner 407×628 (escondido abaixo de `md`), coluna de conteúdo (max 318px). **É o ponto de reuso do Cadastro**: o template não sabe nada sobre login.

### Pages
- `pages/LoginPage`: compõe `AuthTemplate` (banner-login, "Login", "Boas-vindas! Faça seu login."), `LoginForm`, `SocialLogin` e o rodapé `AuthSwitchPrompt` → `/cadastro`. Expõe `onLogin` e `onSocialLogin` (a API ainda não está integrada).

## 3. Como o Cadastro vai reaproveitar

```
pages/RegisterPage
 └─ AuthTemplate bannerSrc="/banner-cadastro.png" title="Cadastro" subtitle="..."
     ├─ organisms/RegisterForm   (novo: FormField × N + Checkbox + Button)
     ├─ molecules/SocialLogin    (reuso)
     └─ molecules/AuthSwitchPrompt "Já tem conta? / Faça seu login!" → /login
```
Só `RegisterForm`, `RegisterPage` e a rota `/cadastro` são novos; o restante já existe.

## 4. Testes

Um `*.test.jsx` ao lado de cada componente (16 arquivos, 30 testes): renderização, variantes/props principais e a interação principal. Por exemplo, o submit do `LoginForm` com os valores digitados e o bloqueio de submit com campos vazios; o `onLogin` repassado pela página. Componentes que usam `Link` são renderizados dentro de `MemoryRouter`.

## 5. Pendências / próximos passos

1. **Sobras do scaffold**: remover `src/App.css`, `src/assets/{hero.png,react.svg,vite.svg}` (não são usados).
2. **Rotas inexistentes**: `/cadastro` e `/esqueci-a-senha` são linkadas mas não existem (a rota `/cadastro` sai junto com a página de Cadastro).
3. **Texto do `SocialLogin`**: transformar "ou entre com outras contas" em prop com valor padrão, caso o Cadastro use outro texto.
4. **Fidelidade visual**: no layout, o divisor é um pouco mais largo que o formulário. Ajuste opcional com margem negativa.
5. **Commit** (Conventional Commits), por exemplo `feat(web): add login page with atomic design components`.

## Verificação

- `pnpm --filter web test`: 16 arquivos / 30 testes passando ✅ (verificado)
- `pnpm web:lint` (oxlint): sem avisos ✅ (verificado)
- `pnpm web:dev` → `http://localhost:5173/` redireciona para `/login`; comparar com o layout em ≥1440px e em mobile (banner escondido abaixo de `md`).
- `pnpm web:build` sem erros.
