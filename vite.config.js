import { defineConfig } from 'vite'

export default defineConfig({
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
  }
})
