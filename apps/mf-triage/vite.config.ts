import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import federation from "@originjs/vite-plugin-federation"
import fs from "fs"
import path from "path"

const BUILD_TIME = new Date().toISOString()

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "")
  return {
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
      name: "mf-triage",
      filename: "remoteEntry.js",
      remotes: {
        shell: env.VITE_REMOTE_SHELL,
      },
      exposes: {
        "./Triage":   "./src/Triage.tsx",
      },
      shared: [
        "react", "react-dom","i18next",
          "react-i18next",
          "@hce/i18n-core", "react-router-dom", "lucide-react", "@emotion/react", "@emotion/styled", "@hce/design-system",
      ],
    }),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server:  { port: 10510 },
  preview: { port: 10510 },
  build: { target: "esnext", minify: false, cssCodeSplit: false },
  }
})
