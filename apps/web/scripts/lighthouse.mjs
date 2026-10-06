// Mede o app com o Lighthouse sobre o build de produção (o dev server distorce a performance).
// Uso: pnpm web:lighthouse [rota ...]   (padrão: /login /cadastro)
import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ['/login', '/cadastro']
const profiles = [
  { name: 'mobile', args: [] },
  { name: 'desktop', args: ['--preset=desktop'] },
]
const METRICS = ['first-contentful-paint', 'largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time']

const isWindows = process.platform === 'win32'
const pnpm = isWindows ? 'pnpm.cmd' : 'pnpm'

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: isWindows, ...options })
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} falhou`)
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      if ((await fetch(BASE_URL)).ok) return
    } catch {
      // servidor ainda subindo
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error('o preview não respondeu a tempo')
}

function summarize(file, label) {
  const report = JSON.parse(readFileSync(file, 'utf-8'))
  const scores = Object.entries(report.categories)
    .map(([name, category]) => `${name} ${Math.round(category.score * 100)}`)
    .join(' · ')
  const metrics = METRICS.map((id) => `${id.replace(/-/g, ' ')}: ${report.audits[id].displayValue}`).join(' · ')
  const failing = Object.values(report.audits)
    .filter((audit) => audit.score !== null && audit.score < 0.9)
    .filter((audit) => !['informative', 'notApplicable', 'manual'].includes(audit.scoreDisplayMode))
    .map((audit) => `    - ${audit.title}${audit.displayValue ? ` (${audit.displayValue})` : ''}`)

  console.log(`\n${label}\n  ${scores}\n  ${metrics}`)
  if (failing.length) console.log(`  auditorias abaixo de 90:\n${failing.join('\n')}`)
}

run(pnpm, ['build'])

const preview = spawn(pnpm, ['exec', 'vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore',
  shell: isWindows,
})

try {
  await waitForServer()
  const outDir = mkdtempSync(join(tmpdir(), 'lighthouse-'))

  for (const route of routes) {
    for (const profile of profiles) {
      const output = join(outDir, `${route.replace(/\W/g, '') || 'home'}-${profile.name}.json`)
      run(pnpm, [
        'dlx',
        'lighthouse',
        `${BASE_URL}${route}`,
        ...profile.args,
        '--output=json',
        `--output-path=${output}`,
        '--chrome-flags=--headless=new',
        '--quiet',
      ])
      summarize(output, `${route} · ${profile.name}`)
    }
  }
} finally {
  if (isWindows) spawnSync('taskkill', ['/pid', String(preview.pid), '/t', '/f'], { stdio: 'ignore' })
  else preview.kill()
}
