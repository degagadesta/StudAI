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
        manualChunks: (id) => {
          // Group React and React-DOM into vendor chunk
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor'
          }
          // Group PDF-related libraries
          if (id.includes('node_modules/react-pdf')) {
            return 'pdf'
          }
          // Group Tiptap editor libraries
          if (id.includes('node_modules/@tiptap')) {
            return 'tiptap'
          }
          // Let other node_modules go into default vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor'
          }
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