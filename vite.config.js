import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// vite.config.js do CMS
export default defineConfig({
  base: '/',
  plugins: [vue()],
  server: {
    port: 5174,
    proxy: {
      // Proxy para o editor (SEM rewrite - mantém /editor no path)
      '^/editor': {
        target: 'http://localhost:5175',
        changeOrigin: true,
        ws: true,
      },
      // Proxy para API
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
