import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// WCAG nível AA: inclui os critérios A e AA das versões 2.0, 2.1 e 2.2
const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 360, height: 800 },
]

// A API é simulada: o teste não depende do back-end nem do seed
const author = { id: 'u1', name: 'julio' }
const summary = (id, overrides = {}) => ({
  id,
  title: `Post ${id}`,
  excerpt: 'Um resumo do post para o feed.',
  thumbnailUrl: null,
  tags: ['React', 'Front-end'],
  author,
  likesCount: 3,
  commentsCount: 2,
  likedByMe: false,
  createdAt: '2026-10-07T12:00:00.000Z',
  links: { self: `/v1/posts/${id}`, comments: `/v1/posts/${id}/comments` },
  ...overrides,
})
const comments = [
  {
    id: 'c1',
    body: 'Achei muito bom seu código!',
    parentId: null,
    author: { id: 'u2', name: 'marcia' },
    createdAt: '2026-10-07T12:10:00.000Z',
    replies: [
      { id: 'c2', body: 'Valeu!', parentId: 'c1', author, createdAt: '2026-10-07T12:20:00.000Z', replies: [] },
    ],
  },
]

async function mockApi(page) {
  await page.route('**/v1/**', (route) => {
    const { pathname } = new URL(route.request().url())
    const json = (body) => route.fulfill({ json: body })

    if (pathname.endsWith('/tags')) return json([{ name: 'React', postsCount: 2 }, { name: 'Front-end', postsCount: 1 }])
    if (pathname.endsWith('/comments')) return json(comments)
    if (pathname.endsWith('/posts')) {
      return json({
        data: [summary('p1'), summary('p2', { thumbnailUrl: '/favicon.svg' })],
        meta: { page: 1, limit: 6, total: 2 },
        links: { self: '/v1/posts?page=1', next: null, prev: null },
      })
    }
    return json({
      ...summary('p1'),
      body: 'A descrição completa do post.',
      code: 'const meta = () => meta() * 2',
      canDelete: false,
    })
  })
}

function formatViolations(violations) {
  return violations
    .map((violation) => {
      const targets = violation.nodes.map((node) => `    - ${node.target.join(' ')}`).join('\n')
      return `[${violation.impact}] ${violation.id}: ${violation.help}\n  ${violation.helpUrl}\n${targets}`
    })
    .join('\n\n')
}

async function expectNoViolations(page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze()
  expect(violations, `\n${formatViolations(violations)}\n`).toEqual([])
}

for (const viewport of viewports) {
  test.describe(`Acessibilidade (WCAG AA) · ${viewport.name} (${viewport.width}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    test.beforeEach(({ page }) => mockApi(page))

    test('Feed sem violações', async ({ page }) => {
      await page.goto('/feed')
      await expect(page.getByRole('article').first()).toBeVisible()
      await expectNoViolations(page)
    })

    test('Detalhes do post sem violações', async ({ page }) => {
      await page.goto('/posts/p1')
      await expect(page.getByRole('heading', { level: 1, name: 'Post p1' })).toBeVisible()
      await expectNoViolations(page)
    })
  })
}
