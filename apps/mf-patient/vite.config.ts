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
      shared:["react","react-dom"]
    })
  ],
  resolve: {
    alias: {
      "@design-system": path.resolve(
        __dirname,
        "../../packages/design-system"
      ),
      react: path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom")
    }
  },
  server: {
    port: 5004
  },
  preview: {
    port: 5004
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false
  }
})  