import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: 'src/content/main.js',
      output: {
        dir: 'dist',
        entryFileNames: 'content.js',
        format: 'iife',
        name: 'ContentScript',
        inlineDynamicImports: true
      }
    },
    outDir: 'dist',
    emptyOutDir: false
  }
})
