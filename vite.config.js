import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        { src: 'src/manifest.json', dest: '.' },
        { src: 'src/icon.png', dest: '.' }   // 这里确保 icon.png 复制到 dist/
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        popup: 'index.html',
        sidepanel: 'sidepanel.html'
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  }
})