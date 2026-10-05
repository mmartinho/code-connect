# Plano: Página de Cadastro (Code Connect)

## Contexto

O Login já existe ([LoginPage.jsx](apps/web/src/pages/LoginPage.jsx)) e foi montado com atomic design, prevendo que o Cadastro usaria o mesmo layout (`AuthTemplate`). Agora implementamos o **Cadastro** a partir do Figma (`5D0tmck5BRsTHhNi3xxAT6`, nó `155:3469` desktop; `155:3344` tablet; `155:3220` mobile). Aproveitamos para fazer os ajustes finos nos componentes compartilhados onde o código diverge do Figma. Para isso, comparamos também o frame de Login desktop (`155:3785`).

Só três coisas são novas: `RegisterForm`, `RegisterPage` e o átomo `Logo`. O resto é reuso, com pequenas extensões.

## 1. Assets (baixar das URLs do `get_design_context`, sem editar)

- `apps/web/public/banner-cadastro.png`: foto `imgRectangle1726` (é uma imagem larga; no Figma, o recorte usa `w 248.77%`, `left -89.74%` ⇒ `object-position ≈ 60% 50%`).
- `apps/web/public/logo/`: os 3 SVGs do logo (`imgGroup4/5/6`, nó `155:3500`). Diferente do `banner-login.png`, aqui o logo **não** vem embutido na foto: ele fica sobreposto a ela.

## 2. Componentes

### Novo
- **atoms/Logo.jsx** (+ test): caixa de 127×40 com as 3 imagens SVG posicionadas pelos insets do Figma, `role="img"` e `aria-label="Code Connect"`. Também vai servir para um header no futuro.
- **organisms/RegisterForm.jsx** (+ test): segue o padrão do [LoginForm.jsx](apps/web/src/components/organisms/LoginForm.jsx), com estado controlado e campos obrigatórios:
  - `FormField` Nome (`name`, placeholder "Nome completo", `autoComplete="name"`)
  - Email (`type="email"`, "Digite seu email", `autoComplete="email"`)
  - Senha (`type="password"`, "******", `autoComplete="new-password"`)
  - `Checkbox` "Lembrar-me"
  - `Button` "Cadastrar" com o ícone `arrow-right`
  - `onSubmit({ name, email, password, remember })`
- **pages/RegisterPage.jsx** (+ test):
  - `AuthTemplate` com `bannerSrc="/banner-cadastro.png"`, `bannerLogo` e `bannerPosition="60% 50%"`
  - título "Cadastro" e subtítulo "Olá! Preencha seus dados."
  - `RegisterForm`, depois `SocialLogin` (reuso)
  - rodapé: `AuthSwitchPrompt layout="inline"` com "Já tem conta?" / "Faça seu login!" → `/login`, ícone `login`
  - props `onRegister` e `onSocialLogin`
- **App.jsx**: rota `/cadastro` → `RegisterPage`.

### Extensões para reuso
- **templates/AuthTemplate.jsx**:
  - nova prop opcional `bannerLogo` (sobrepõe o `Logo` ao banner, centralizado, ~35px da borda inferior)
  - nova prop opcional `bannerPosition` (classe de `object-position`)
  - o banner passa a ocupar a altura da coluna (`self-stretch` + `object-cover`), em vez de `h-[628px]` fixo. No Cadastro são 675px e no Login 632px.
- **molecules/AuthSwitchPrompt.jsx**: prop `layout`.
  - `stacked` (padrão, Login): pergunta de 15px centralizada, link embaixo.
  - `inline` (Cadastro): pergunta e link na mesma linha, alinhados à esquerda, gap de 8px e `flex-wrap`. No mobile o link quebra para a linha de baixo, como no Figma.
- **atoms/Icon.jsx**: novo ícone `login` (path do Material "login").

## 3. Ajustes finos (diferenças entre código e Figma, valem para Login e Cadastro)

| Onde | Hoje | Figma |
|---|---|---|
| `index.css` token `page` | `#01080e` | `#00090e` (Grafite) + novo token `petroleum #132e35` |
| Card (`AuthTemplate`) | max 994, `px-[76px]`, gap 68, coluna máx. 318 | 996, `px-[78px] py-14`, borda 1px `page`, `justify-between`, coluna `w-[410px] px-8` (346 úteis) |
| Header | gap 32, título 30px, subtítulo 20px | gap 24, título `text-[31px]`, subtítulo `text-[22px]` |
| Rodapé | gap 32 até o conteúdo | gap 24 (o bloco do conteúdo mantém o gap de 32) |
| `Input` | `h-10`, 16px, placeholder `surface/70` | `py-2 text-[15px]` (≈38px), placeholder `surface` |
| `Checkbox` | 24px, borda 1px `offwhite`, rótulo 14px | 28px (`border-2 border-muted`, check de 16px), rótulo 15px |
| `Button` | `text-xl`, texto `surface`, `h-12` | `text-lg` semibold, texto `petroleum`, `py-3`, ícone 24px |
| `Divider` / `SocialLogin` | texto 14px, gap 12 | texto 15px, gap 8 |
| `TextLink accent` | 20px, gap 8 | 18px, gap 12, ícone 24px |
| Responsivo | banner escondido abaixo de `md`; layout em linha a partir de `md` | layout em linha só a partir de `lg` (tablet de 768px empilha); tablet e mobile mostram o banner em cima do formulário (recorte paisagem, `object-cover`). No Login, usar `object-bottom` para manter o logo embutido. Conferir medidas com `get_design_context` dos nós `155:3344`/`155:3220` antes de implementar. |

Observação: no Figma, o formulário do Login tem 318px de largura (centralizado), enquanto o do Cadastro tem 346px. Vamos padronizar em 346px. A diferença visual é de 14px por lado e o template fica mais simples.

## 4. Testes

- Novos: `Logo.test.jsx`, `RegisterForm.test.jsx` (renderiza os campos; envia os valores digitados; bloqueia o envio com campos vazios), `RegisterPage.test.jsx` (título, banner, botão "Cadastrar", social, link `/login`; repassa os dados para `onRegister`).
- Atualizar: `AuthTemplate.test.jsx` (logo aparece só com `bannerLogo`), `AuthSwitchPrompt.test.jsx` (variante `inline`), `Icon.test.jsx` (`login`).
- Os testes atuais de Login continuam passando sem mudança de comportamento.

## Verificação

1. `pnpm --filter web test`: todos verdes.
2. `pnpm web:lint` e `pnpm web:build` sem erros.
3. `pnpm web:dev`: comparar `/cadastro` e `/login` com os screenshots do Figma em 1440px+, 768px e 360px. Conferir o logo sobreposto, o recorte do banner, os tamanhos de fonte e o checkbox. Clicar nos links "Faça seu login!" ↔ "Crie seu cadastro!".
4. Conferir que não sobrou nenhuma URL `figma.com/api/mcp/asset` no código e que os arquivos em `public/` não estão vazios.
5. Commit: `feat(web): add register page and align auth layout with figma`.
