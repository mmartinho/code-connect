# Plano: integrar o frontend (`apps/web`) com a API via Axios

## Contexto

A API NestJS (`apps/api`) já expõe autenticação JWT e usuários, documentados no Swagger (`/docs`). O frontend tem as páginas de Login e Cadastro, mas elas não estão ligadas a nada: os forms validam e chamam `onSubmit?.()`, e o `App.jsx` não passa esse callback. O objetivo é ligar as duas pontas com **Axios**: cadastrar, logar, guardar o token, buscar o usuário logado e mostrá-lo numa página protegida `/perfil`.

Contrato da API (estado atual do código):
| Método | Rota | Corpo | Sucesso | Erros |
|---|---|---|---|---|
| POST | `/v1/auth/tokens` | `{ email, password }` | 201 `{ accessToken, tokenType: "Bearer", expiresIn: 3600 }` | 401 "Invalid credentials", 422 |
| POST | `/v1/users` | `{ name, email, password(8–72) }` | 201 `{ id, name, email, createdAt }` (sem token) | 409 email já cadastrado, 422 |
| GET | `/v1/users/me` | header `Authorization: Bearer <token>` | 200 `UserResponseDto` | 401 |

Detalhes que importam: o CORS já libera `http://localhost:5173`. Campos extras no corpo dão 422 (`forbidNonWhitelisted`), então **não** enviar `remember`. Erros de validação vêm com `message: string[]`. Não existe refresh token: com 401, o usuário volta para o login.

Decisões (confirmadas com você):
- Página `/perfil` protegida, com os dados do `/users/me` e um botão "Sair".
- O campo do login passa a ser "Email" (`type="email"`, validação de email).
- Depois do cadastro, o login é automático.

## 1. Dependência e configuração

- `pnpm --filter web add axios`
- `apps/web/.env.example`: `VITE_API_URL=http://localhost:3000/v1`. O código usa esse valor como fallback, então funciona sem `.env`.
- Sem proxy no Vite: o CORS da API já cobre a origem do Vite.

## 2. Camada de serviços (`apps/web/src/services/`, novo)

- **`tokenStorage.js`**:
  - `getToken()`: lê do `localStorage`; se não houver, do `sessionStorage`.
  - `setToken(token, remember)`: grava no `localStorage` se `remember`, senão no `sessionStorage`. Assim o "Lembrar-me" dos dois forms passa a ter efeito.
  - `clearToken()`: limpa os dois.
  - Chave: `code-connect.token`.
- **`api.js`**: `axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/v1', headers: { Accept: 'application/json' } })`.
  - Interceptor de request: se houver token, adiciona `Authorization: Bearer <token>`.
  - Interceptor de response: em 401 de uma requisição que levava token, chama `clearToken()` e rejeita normalmente. Quem chamou decide o que fazer.
- **`auth.js`**, uma função por recurso REST, retornando `response.data`:
  - `createToken({ email, password })` → `POST /auth/tokens`
  - `createUser({ name, email, password })` → `POST /users`
  - `getCurrentUser()` → `GET /users/me`
- **`errors.js`**: `getErrorMessage(error)` traduz o erro do Axios para uma mensagem em português:
  - sem `response` (rede/API fora): "Não foi possível conectar ao servidor. Tente novamente."
  - 401: "Email ou senha inválidos."
  - 409: "Este email já está cadastrado."
  - 422: junta o `message[]` da API
  - outros: "Algo deu errado. Tente novamente."

## 3. Estado de autenticação (`apps/web/src/context/AuthContext.jsx`, novo)

- `AuthProvider` guarda `user` e `status` (`'loading' | 'authenticated' | 'anonymous'`).
- Ao montar: se houver token, chama `getCurrentUser()`. Se der certo, `authenticated`; se falhar, `clearToken()` e `anonymous`.
- Ações:
  - `login({ email, password, remember })`: `createToken`, `setToken`, `getCurrentUser`, `setUser`.
  - `register({ name, email, password, remember })`: `createUser`, depois `login(...)`.
  - `logout()`: `clearToken`, `setUser(null)`.
- Hook `useAuth()`: lança erro se usado fora do provider.

## 4. Rotas (`App.jsx` + `apps/web/src/routes/`)

- `App.jsx` envolve tudo em `<AuthProvider>`.
  - `/` → `<Navigate to="/perfil">`
  - `/login` e `/cadastro` ficam dentro de `<GuestOnly>`
  - `/perfil` fica dentro de `<RequireAuth>`
- **`routes/RequireAuth.jsx`**:
  - `loading`: mostra "Carregando…" (`role="status"`)
  - `anonymous`: `<Navigate to="/login" replace state={{ from: location }}>`
  - senão: renderiza `children`
- **`routes/GuestOnly.jsx`**: se `authenticated`, vai para `/perfil`.

## 5. Componentes (atomic design; Tailwind; cada um com teste)

- **atoms/Alert.jsx** (novo): `<p role="alert">` com o estilo de erro (`text-error`), para o erro do servidor no topo do form. Não renderiza nada sem `children`.
- **organisms/LoginForm.jsx**:
  - Campo `login` passa a ser `email`: label "Email", `type="email"`, `autoComplete="email"`, validação com `emailMessage`.
  - `onSubmit({ email, password, remember })`.
  - Novas props: `submitting` (desabilita o botão e mostra "Entrando…") e `error` (renderiza `Alert`).
- **organisms/RegisterForm.jsx**:
  - Valida senha com no mínimo 8 caracteres no cliente (mensagem "A senha deve ter pelo menos 8 caracteres."), para evitar o 422.
  - Mesmas props novas `submitting` ("Cadastrando…") e `error`.
- **utils/validation.js**: adicionar `minLengthMessage(value, min, message)` e o teste correspondente.
- **pages/LoginPage.jsx** / **pages/RegisterPage.jsx**:
  - Usam `useAuth()` e `useNavigate()`, controlando os estados `submitting` e `error`.
  - Se der certo, navegam para `location.state?.from?.pathname ?? '/perfil'` (cadastro sempre vai para `/perfil`).
  - Se falhar, `error = getErrorMessage(err)`.
  - A prop `onSocialLogin` continua como está (o social login segue fora do escopo).
  - As props `onLogin`/`onRegister` saem.
- **pages/ProfilePage.jsx** (novo), em `/perfil`:
  - `<title>Perfil · Code Connect</title>`, `Logo`, `Heading` "Meu perfil".
  - `<dl>` com Nome, Email e "Membro desde" (`createdAt` formatado com `Intl.DateTimeFormat('pt-BR')`).
  - `Button` "Sair": chama `logout()` e navega para `/login`.
  - Layout simples centralizado, com os tokens de cor já existentes em `index.css` (`page`, `surface`, `petroleum`…).

## 6. Testes (Vitest + Testing Library, ao lado de cada arquivo)

Mock de HTTP: `vi.mock('../services/auth')` nos testes de contexto e de páginas. Para `api.js`, um adapter customizado do Axios (`api.defaults.adapter = vi.fn(...)`), sem instalar MSW.

- `services/tokenStorage.test.js`: decide entre local e session conforme `remember`; `clearToken` limpa os dois.
- `services/api.test.js`: adiciona o header Bearer quando há token; não adiciona sem token; 401 limpa o token.
- `services/auth.test.js`: cada função chama o método e a rota corretos com o corpo certo (sem `remember`).
- `services/errors.test.js`: rede, 401, 409, 422 (array) e genérico.
- `context/AuthContext.test.jsx`:
  - restaura a sessão a partir do token
  - token inválido vira `anonymous`
  - `login` e `register` (que encadeia o login)
  - `logout`
- `routes/RequireAuth.test.jsx`, `routes/GuestOnly.test.jsx`: redirecionamentos e estado de loading.
- `atoms/Alert.test.jsx`.
- Testes a atualizar:
  - `LoginForm.test.jsx`: campo Email, email inválido, `submitting`, `error`.
  - `RegisterForm.test.jsx`: senha curta, `submitting`, `error`.
- Páginas:
  - `LoginPage.test.jsx`, `RegisterPage.test.jsx`: envolvidas em `AuthProvider` + `MemoryRouter`. Se der certo, navegam para `/perfil`; se falhar, mostram a mensagem.
  - `ProfilePage.test.jsx`: mostra os dados; "Sair" volta para `/login`.

## 7. Docs

- `CLAUDE.md`: trocar "Not yet connected to the API; no proxy…" por uma linha sobre `src/services/api.js` (Axios), `VITE_API_URL` e a necessidade de rodar `pnpm api:dev` + `pnpm db:up` junto com o web.

## Verificação

1. `pnpm --filter web test`: tudo verde. `pnpm web:lint` e `pnpm web:build` sem erros.
2. End-to-end manual: `pnpm db:up`, `pnpm api:dev` e `pnpm web:dev`.
   - `/cadastro` com dados válidos cai em `/perfil` com nome e email.
   - "Sair" leva a `/login`.
   - Logar com senha errada mostra "Email ou senha inválidos."
   - Cadastrar email repetido mostra "Este email já está cadastrado."
   - Recarregar `/perfil` com "Lembrar-me" mantém a sessão; sem ele, a sessão some ao fechar a aba.
   - Na aba Network: `Authorization: Bearer …` em `/v1/users/me`.
   - Com a API desligada, aparece a mensagem de conexão.
3. `pnpm --filter web test:a11y` continua passando para `/login` e `/cadastro`.

## Commit

`feat(web): integrate auth and profile with the api using axios` (Conventional Commits). Depois da aprovação, mover este plano para `plans/web-api-integration.md`.
