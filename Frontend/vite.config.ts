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
        // Remove manual chunks to avoid version compatibility issues
      }
    },
    sourcemap: false,
    minify: true // Use default minifier instead of esbuild
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'axios']
  }
})