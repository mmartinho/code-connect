# Plano: Correções do Lighthouse (Cadastro e Login)

## Contexto

O Lighthouse rodado em `/cadastro` apontou performance ruim: **FCP 2,6s (score 0,11)**, **LCP 5,9s (0,04)** e **Speed Index 2,6s (0,38)**. O relatório colado veio cortado, sem a lista de auditorias que falharam, e foi gerado sobre `localhost:5173`, o **servidor de desenvolvimento** do Vite. Lá os módulos não são empacotados nem minificados e há o cliente de HMR, então os números de performance ficam inflados.

Objetivo: medir direito (build de produção), corrigir o que o Lighthouse aponta e deixar a medição fácil de repetir.

## Passo 0: medir no build de produção (linha de base)

- Rodar `pnpm web:build` e `vite preview --port 4173`.
- Rodar o Lighthouse CLI (`pnpm dlx lighthouse`) com o Chrome instalado em `/cadastro` e `/login`, nos perfis **mobile** (padrão) e **desktop** (`--preset=desktop`). Salvar os JSON em um diretório temporário, fora do repositório.
- Extrair com `jq`: scores das quatro categorias, auditorias com `score < 1` e o elemento de LCP.
- **Se o relatório mostrar algo além das hipóteses abaixo**, incluir no trabalho e relatar ao usuário antes de mexer em algo que mude o visual.

## Hipóteses já confirmadas pela análise do código

| # | Problema | Evidência | Correção |
|---|---|---|---|
| 1 | **Banner do Cadastro pesado: provável elemento de LCP** | [banner-cadastro.png](apps/web/public/banner-cadastro.png) tem **1,44 MB** (PNG 1344×896), exibido em no máximo ~1012×675 com recorte | Converter para **WebP** (qualidade ~75, mesma resolução). Fazer o mesmo com o [banner-login.png](apps/web/public/banner-login.png) (327 KB). Usar `sharp` em um script único `pnpm dlx sharp-cli`, sem dependência nova. Remover os PNGs e atualizar `bannerSrc` em [RegisterPage.jsx](apps/web/src/pages/RegisterPage.jsx) e [LoginPage.jsx](apps/web/src/pages/LoginPage.jsx) e os testes que checam o `src`. |
| 2 | Banner sem prioridade de carregamento | `<img>` em [AuthTemplate.jsx](apps/web/src/components/templates/AuthTemplate.jsx) sem `fetchpriority`/`decoding` | Adicionar `fetchPriority="high"` e `decoding="async"` no banner (é a imagem de LCP), e `width`/`height` intrínsecos para evitar CLS. |
| 3 | Fonte do Google bloqueia a renderização | `<link rel="stylesheet">` para `fonts.googleapis.com` em [index.html](apps/web/index.html), FCP 2,6s | **Hospedar a Prompt localmente**: `.woff2` dos pesos 400 e 600 (subset latin) em `public/fonts/`, `@font-face` com `font-display: swap` no [index.css](apps/web/src/index.css) e `<link rel="preload" as="font" crossorigin>` para os dois arquivos. Remove duas conexões externas e o CSS bloqueante. |
| 4 | Peso de fonte sem uso | A URL pede `400;500;600`, mas o código só usa `font-semibold` (600) e o regular (400) | Deixa de existir com o item 3, porque só os pesos 400 e 600 serão hospedados. |
| 5 | SEO: falta `meta description` | [index.html](apps/web/index.html) não tem | Adicionar uma descrição padrão no `index.html`. Nas páginas, `<meta name="description">` específico ao lado do `<title>`, que o React 19 move para o `<head>`. |
| 6 | Logo em 3 requisições separadas | [Logo.jsx](apps/web/src/components/atoms/Logo.jsx) carrega 3 SVGs | Baixo impacto: só mexer se o Lighthouse apontar (por exemplo, "network dependency tree"). |

O app é uma SPA, então FCP e LCP dependem do bundle JS (~85 KB gzip). Se o Lighthouse de produção ainda apontar JS bloqueante, avaliar `React.lazy` por rota em [App.jsx](apps/web/src/App.jsx). Hoje não parece necessário.

## Tornar a medição repetível

- Novo script `apps/web/scripts/lighthouse.mjs` (ou um script npm com `lighthouse` via `pnpm dlx`): faz o build, sobe o preview, roda o Lighthouse nas duas rotas e imprime os scores e as auditorias que falharam.
- Script `web:lighthouse` na raiz.
- Sem budget/CI nesta etapa. Fica como sugestão.

## Verificação

1. Lighthouse de produção **antes e depois**, em mobile e desktop, nas duas rotas. Reportar a tabela de scores e de métricas (FCP, LCP, CLS, TBT).
2. Conferir que o elemento de LCP passou a ser o banner WebP com `fetchpriority=high` e que os PNGs não são mais requisitados.
3. `pnpm web:test`, `pnpm web:a11y`, `pnpm web:lint` e `pnpm web:build` verdes.
4. Comparar visualmente em 1440, 768 e 360px com as capturas anteriores: banner, recorte, fonte Prompt e logo devem ficar iguais.
5. Commit em Conventional Commits, por exemplo `perf(web): optimize banner images and self-host fonts`, só quando o usuário pedir.

Observação: há mudanças de acessibilidade ainda sem commit no working tree (testes e correções WCAG). Elas não serão misturadas com este trabalho sem perguntar.
