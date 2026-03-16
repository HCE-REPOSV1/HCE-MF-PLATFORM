import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import federation from "@originjs/vite-plugin-federation"

export default defineConfig({
  plugins: [
    react(),
    federation({
      name:"mf-home",
      filename:"remoteEntry.js",
      exposes:{
        "./Home":"./src/Home.tsx"
      },
      shared: [
        "react",
        "react-dom",
        "react-router-dom",
        "lucide-react",
        "@mui/material",
        // "@mui/icons-material",
        "@emotion/react",
        "@emotion/styled",
        "@jarvis/design-system"
      ],
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
    port: 5103
  },
  preview: {
    port: 5103
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false
  }
})  