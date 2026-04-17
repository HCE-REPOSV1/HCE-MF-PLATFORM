import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import federation from "@originjs/vite-plugin-federation"
import fs from "fs"
import path from "path"

const BUILD_TIME = new Date().toISOString()

export default defineConfig({
  plugins: [
    react(),
    {
      name: "version-json",
      closeBundle() {
        const outDir = path.resolve(__dirname, "dist")
        fs.writeFileSync(
          path.join(outDir, "version.json"),
          JSON.stringify({ buildTime: BUILD_TIME }),
        )
      },
    },
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
    dedupe: ["react", "react-dom"],
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
