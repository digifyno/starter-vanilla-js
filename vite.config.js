import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  // Base URL for deployment — override with VITE_BASE_URL env var if needed
  base: process.env.VITE_BASE_URL || '/',

  build: {
    // Warn when chunks exceed 500KB
    chunkSizeWarningLimit: 500,
  },

  server: {
    // Development server port
    port: 5173,
    strictPort: false
  },

  plugins: [
    {
      // Strip ws://localhost:* from CSP in production — only needed for Vite HMR in dev
      name: 'strip-dev-csp',
      transformIndexHtml(html) {
        if (command === 'serve') return html
        return html.replace(/ ws:\/\/localhost:\*/g, '')
      }
    }
  ],

  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.js'],
      exclude: ['src/**/*.test.js'],
      thresholds: {
        statements: 75,
        branches: 70,
        functions: 80,
        lines: 75
      }
    }
  }
}))
