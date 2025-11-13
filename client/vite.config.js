import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

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
        // ⚠️ Change localhost → EC2 public IP
        target: "http://35.92.203.139:3001/",
        changeOrigin: true,
      },
    },
    host: "0.0.0.0", // allows all incoming connections
    port: 5173,       // you can leave this or change if needed
    allowedHosts: [
      "35.92.203.139",   // ✅ your EC2 instance public IP
      "localhost",
    ],
  },
})
