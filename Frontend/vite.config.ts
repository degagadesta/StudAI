import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          pdf: ['react-pdf'],
          tiptap: ['@tiptap/react', '@tiptap/starter-kit']
        }
      }
    },
    sourcemap: false,
    minify: 'esbuild'
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'axios']
  }
})