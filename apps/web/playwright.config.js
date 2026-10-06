import { defineConfig } from '@playwright/test'

const port = 4174

export default defineConfig({
  testDir: './e2e',
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${port}`,
    // Usa o Chrome instalado na máquina, sem baixar navegadores do Playwright
    channel: 'chrome',
  },
  webServer: {
    command: `pnpm exec vite --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    reuseExistingServer: true,
  },
})
