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
        "@hce/design-system",
      ],
    }),
  ],
  resolve: {
    alias: [
      { find: "react/jsx-runtime",     replacement: path.resolve(__dirname, "../../node_modules/react/jsx-runtime.js") },
      { find: "react/jsx-dev-runtime", replacement: path.resolve(__dirname, "../../node_modules/react/jsx-dev-runtime.js") },
      { find: "react-dom/client",      replacement: path.resolve(__dirname, "../../node_modules/react-dom/client.js") },
      { find: "react-dom",             replacement: path.resolve(__dirname, "../../node_modules/react-dom") },
      { find: "react",                 replacement: path.resolve(__dirname, "../../node_modules/react") },
    ],
  },
  server: {
    port: 10501,
  },
  preview: {
    port: 10501,
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
})
