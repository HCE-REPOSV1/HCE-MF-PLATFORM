import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import federation from "@originjs/vite-plugin-federation"
import path from "path"

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mf-emergency",
      filename: "remoteEntry.js",
      exposes: {
        "./Emergency": "./src/Emergency.tsx"
      },
      shared: ["react", "react-dom"]
    })
  ],
  resolve: {
    // dedupe garantiza que solo exista UNA instancia de React en toda la app,
    // evitando el error "Invalid hook call" cuando el design system (monorepo)
    // y el MF resuelven React desde distintas carpetas de node_modules
    dedupe: ["react", "react-dom"],
    alias: {
      "@design-system": path.resolve(__dirname, "../../packages/design-system"),
      "react":          path.resolve(__dirname, "./node_modules/react"),
      "react-dom":      path.resolve(__dirname, "./node_modules/react-dom")
    }
  },
  server: {
    port: 5106
  },
  preview: {
    port: 5106
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false
  }
})
