import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import federation from "@originjs/vite-plugin-federation"

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mf-auth",
      filename: "remoteEntry.js",
      exposes: {
        "./Login": "./src/Login.tsx",
      },
      shared: [
        "react",
        "react-dom",
        "react-router-dom",
        "lucide-react",
        "@mui/material",
        "@emotion/react",
        "@emotion/styled",
        "@jarvis/design-system",
      ],
    }),
  ],
  resolve: {
    alias: {
      "@design-system":        path.resolve(__dirname, "../../packages/design-system"),
      "@jarvis/design-system": path.resolve(__dirname, "../../packages/design-system"),
      react:       path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom"),
    },
  },
  server: {
    port: 5100,
  },
  preview: {
    port: 5100,
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
})
