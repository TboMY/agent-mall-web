import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    // remote git test
    // remote git test
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
