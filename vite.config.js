import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',  // Explicitly set output directory
  },
  server: {
    port: 5173,  // Default dev port
  },
})