import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    historyApiFallback: true, // This ensures all routes fallback to index.html
  },
  preview: {
    port: 3000,
    open: true,
    historyApiFallback: true, // Also for preview/production build
  }
})