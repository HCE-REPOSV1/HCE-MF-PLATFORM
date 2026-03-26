import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import federation from "@originjs/vite-plugin-federation"

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mf-ambulatorio",
      filename: "remoteEntry.js",
      exposes: {
        "./Ambulatorio": "./src/Ambulatorio.tsx",
        "./menuConfig":  "./src/menuConfig.ts",
      },
      shared: ["react", "react-dom", "react-router-dom", "lucide-react"],
    }),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "react":     path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
  server:  { port: 5104 },
  preview: { port: 5104 },
  build: { target: "esnext", minify: false, cssCodeSplit: false },
})
