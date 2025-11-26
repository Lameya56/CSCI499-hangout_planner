import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const isLocal = process.env.LOCAL === "TRUE"
const targetAPI = isLocal
? "http://localhost:3001"
: "https://lets-go.site"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../server/public",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: [
      "lets-go.site",
      "localhost",
    ],
  },
})
