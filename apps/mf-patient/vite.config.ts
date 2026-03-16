import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import federation from "@originjs/vite-plugin-federation"
export default defineConfig({
  plugins: [
    react(),
    federation({
      name:"mf-patient",
      filename:"remoteEntry.js",
      exposes:{
        "./Patient":"./src/Patient.tsx"
      },
      shared: ["react", "react-dom","react-router-dom", "lucide-react" ]
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
    port: 5104
  },
  preview: {
    port: 5104
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false
  }
})  