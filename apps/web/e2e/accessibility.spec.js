import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// WCAG nível AA: inclui os critérios A e AA das versões 2.0, 2.1 e 2.2
const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const pages = [
  { name: 'Login', path: '/login' },
  { name: 'Cadastro', path: '/cadastro' },
]

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 360, height: 800 },
]

function formatViolations(violations) {
  return violations
    .map((violation) => {
      const targets = violation.nodes.map((node) => `    - ${node.target.join(' ')}`).join('\n')
      return `[${violation.impact}] ${violation.id}: ${violation.help}\n  ${violation.helpUrl}\n${targets}`
    })
    .join('\n\n')
}

for (const { name, path } of pages) {
  test.describe(`Acessibilidade (WCAG AA) · ${name}`, () => {
    for (const viewport of viewports) {
      test(`sem violações no ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto(path)
        await page.waitForLoadState('networkidle')
        await page.evaluate(() => document.fonts.ready)

        const { violations } = await new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze()

        expect(violations, `\n${formatViolations(violations)}\n`).toEqual([])
      })
    }

    test('sem violações com as mensagens de erro exibidas', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      await page.getByRole('button', { name: /login|cadastrar/i }).click()
      await expect(page.getByRole('alert').first()).toBeVisible()

      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze()

      expect(violations, `\n${formatViolations(violations)}\n`).toEqual([])
    })
  })
}
