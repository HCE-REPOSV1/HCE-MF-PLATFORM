import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import federation from "@originjs/vite-plugin-federation"

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mf-shell",
      remotes: {
        auth:        "http://localhost:10301/assets/remoteEntry.js",
        home:        "http://localhost:10302/assets/remoteEntry.js",
        emergency:   "http://localhost:10303/assets/remoteEntry.js",
        hospital:    "http://localhost:10304/assets/remoteEntry.js",
        ambulatorio: "http://localhost:10305/assets/remoteEntry.js",
        auditoria:   "http://localhost:10306/assets/remoteEntry.js",
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
    alias: {
      react:       path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom"),
    },
  },
  build: {
    target:       "esnext",
    minify:       false,
    cssCodeSplit: false,
  },
  server:  { port: 10300 },
  preview: { port: 10300 },
})
