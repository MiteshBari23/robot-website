import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // ✅ ensure this
  },
  server: {
    
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // optional, but helps
    },
  },
})
