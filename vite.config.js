import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// vite.config.js do CMS
export default defineConfig({
  base: '/',
  plugins: [vue()],
  build: {
    // Otimizações para produção
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        // Separar vendors em chunks para melhor cache
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'vue-flow': ['@vue-flow/core', '@vue-flow/background', '@vue-flow/controls', '@vue-flow/minimap'],
          'utils': ['axios', 'jwt-decode', 'uuid']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
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
