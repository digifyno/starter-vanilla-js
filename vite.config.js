import { defineConfig } from 'vite'

export default defineConfig({
  // Base URL for deployment — override with VITE_BASE_URL env var if needed
  base: '/',

  build: {
    // Warn when chunks exceed 500KB
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: undefined
      }
    }
  },

  server: {
    // Development server port
    port: 5173,
    strictPort: false
  }
})
