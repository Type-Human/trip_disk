import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', 
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },

  // УДАЛЯЕМ старые пути или исправляем
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        // Если у тебя нет scss файлов, удали этот блок
        additionalData: `
          @use "${path.resolve(__dirname, './scss/abstract/variables')}" as *;
          @use "${path.resolve(__dirname, './scss/abstract/themes')}" as *;
        `,
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'), // Меняем ./src на .
      '~': path.resolve(__dirname, '.'), // Меняем ./src на .
    },
  },
})
