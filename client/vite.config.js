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
    outDir: '../server/public', // this builds your frontend into your Express public folder
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0", // ✅ makes your app accessible from outside EC2
    port: 5173,      // (optional) specify port if needed
    proxy: {
      '/api': {
        target: 'http://18.216.222.0:3001', // ✅ point to your backend API
        changeOrigin: true,
      }
    }
  }
})
