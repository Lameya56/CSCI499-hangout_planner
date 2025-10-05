import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: '../server/public', //this is putting the built files in express app
    emptyOutDir: true
  },
  server: {
    proxy: {
      //all api requests that start with /api will be sent to the backend
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
  
  
})