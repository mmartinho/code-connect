import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// Critérios WCAG AA que o axe não consegue verificar sozinho (ou que ele só trata como boa prática)
const pages = [
  { name: 'Login', path: '/login', title: /login/i },
  { name: 'Cadastro', path: '/cadastro', title: /cadastro/i },
]

async function open(page, path, viewport = { width: 1440, height: 900 }) {
  await page.setViewportSize(viewport)
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
}

function horizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
}

function clippedElements(page, { checkHeight = false } = {}) {
  return page.evaluate((withHeight) => {
    return [...document.querySelectorAll('h1, p, label, button, a, input')]
      .filter((el) => getComputedStyle(el).overflow !== 'visible')
      .filter((el) => el.scrollWidth > el.clientWidth + 1 || (withHeight && el.scrollHeight > el.clientHeight + 1))
      .map((el) => el.outerHTML.slice(0, 60))
  }, checkHeight)
}

for (const { name, path, title } of pages) {
  test.describe(`WCAG AA além do axe · ${name}`, () => {
    test('2.4.2 Título da página descreve o seu propósito', async ({ page }) => {
      await open(page, path)

      await expect(page).toHaveTitle(title)
    })

    test('boas práticas do axe: landmarks, ordem de títulos e um único h1', async ({ page }) => {
      await open(page, path)

      const { violations } = await new AxeBuilder({ page }).withTags(['best-practice']).analyze()

      expect(
        violations.map((v) => `${v.id}: ${v.help} -> ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
      ).toEqual([])
    })

    test('2.1.1 / 2.4.3 Todos os controles são alcançáveis pelo teclado, em ordem visual', async ({ page }) => {
      await open(page, path)

      const expected = await page
        .locator('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
        .evaluateAll((els) =>
          els.filter((el) => el.getClientRects().length > 0 && !el.disabled).map((el) => el.outerHTML.slice(0, 80)),
        )

      const visited = []
      for (let i = 0; i < expected.length; i++) {
        await page.keyboard.press('Tab')
        visited.push(await page.evaluate(() => document.activeElement.outerHTML.slice(0, 80)))
      }

      expect(visited).toEqual(expected)
    })

    test('2.4.7 / 1.4.11 Todo controle focado tem indicador de foco visível', async ({ page }) => {
      await open(page, path)

      const count = await page.locator('a[href], button, input').count()
      const problems = []

      for (let i = 0; i < count; i++) {
        await page.keyboard.press('Tab')
        const result = await page.evaluate(() => {
          const el = document.activeElement
          const style = getComputedStyle(el)
          const hasOutline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2
          const hasRing = style.boxShadow !== 'none'
          return {
            label: el.getAttribute('aria-label') || el.name || el.textContent.trim().slice(0, 30) || el.tagName,
            visible: hasOutline || hasRing,
            outline: `${style.outlineWidth} ${style.outlineStyle} ${style.outlineColor}`,
          }
        })
        if (!result.visible) problems.push(`${result.label}: sem indicador de foco (${result.outline})`)
      }

      expect(problems).toEqual([])
    })

    test('1.4.10 Reflow: sem rolagem horizontal em 320px', async ({ page }) => {
      await open(page, path, { width: 320, height: 800 })

      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0)
    })

    test('1.4.4 Texto ampliado em 200% não é cortado e não gera rolagem horizontal', async ({ page }) => {
      await open(page, path)
      await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })

      expect(await clippedElements(page)).toEqual([])
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0)
    })

    test('1.4.12 Espaçamento de texto ajustado pelo usuário não quebra o layout', async ({ page }) => {
      await open(page, path)
      await page.addStyleTag({
        content: `* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
                  p { margin-bottom: 2em !important; }`,
      })

      expect(await clippedElements(page, { checkHeight: true })).toEqual([])
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0)
    })

    test('2.5.3 O nome acessível de cada controle contém o seu texto visível', async ({ page }) => {
      await open(page, path)

      const mismatches = await page.evaluate(() =>
        [...document.querySelectorAll('a[href], button')]
          .map((el) => ({
            visible: el.innerText.trim().toLowerCase(),
            name: (el.getAttribute('aria-label') || el.innerText).trim().toLowerCase(),
            html: el.outerHTML.slice(0, 60),
          }))
          .filter(({ visible, name }) => visible && !name.includes(visible)),
      )

      expect(mismatches).toEqual([])
    })

    test('1.4.1 Links ao lado de texto não dependem só da cor', async ({ page }) => {
      await open(page, path)

      const colorOnly = await page.evaluate(() =>
        [...document.querySelectorAll('a[href]')]
          .filter((el) => {
            const style = getComputedStyle(el)
            const parentStyle = getComputedStyle(el.parentElement)
            const hasUnderline = style.textDecorationLine.includes('underline')
            const hasSiblingText = [...el.parentElement.children].some((n) => n !== el && n.textContent.trim())
            return !hasUnderline && style.color !== parentStyle.color && hasSiblingText
          })
          .map((el) => el.textContent.trim()),
      )

      expect(colorOnly).toEqual([])
    })

    test('3.3.1 / 3.3.2 Campos obrigatórios são identificados e erros são anunciados', async ({ page }) => {
      await open(page, path)

      const inputs = page.locator('form input:not([type="checkbox"])')
      const count = await inputs.count()
      const problems = []

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i)
        const info = await input.evaluate((el) => ({
          required: el.required,
          ariaRequired: el.getAttribute('aria-required'),
          label: `${el.labels[0]?.innerText ?? ''}${getComputedStyle(el.labels[0], '::after').content}`,
        }))
        // o rótulo precisa indicar que o campo é obrigatório (ex.: asterisco ou "obrigatório")
        if (info.required && info.ariaRequired !== 'true' && !/\*|obrigat/i.test(info.label)) {
          problems.push(`${info.label}: campo obrigatório sem indicação visível`)
        }
      }

      await page.getByRole('button', { name: /login|cadastrar/i }).click()
      const alerts = await page.locator('[role="alert"], [aria-live], [aria-invalid="true"]').count()
      if (alerts === 0) problems.push('envio inválido não produz mensagem de erro acessível (role="alert"/aria-invalid)')

      expect(problems).toEqual([])
    })
  })
}
