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
        "@hce/design-system"
      ],
    })
  ],
  resolve: {
    alias: {
      react: path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom")
    }
  },
  server: {
    port: 10302
  },
  preview: {
    port: 10302
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false
  }
})  