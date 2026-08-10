import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import federation from "@originjs/vite-plugin-federation"
import fs from "fs"
import path from "path"

const BUILD_TIME = new Date().toISOString()

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "")

  if (!env.VITE_REMOTE_SHELL) throw new Error("[mf-auth] Falta variable de entorno: VITE_REMOTE_SHELL")

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
      name: "mf-auth",
      filename: "remoteEntry.js",
      remotes: {
        shell: env.VITE_REMOTE_SHELL,
      },
      exposes: {
        "./Login": "./src/Login.tsx",
      },
      shared: [
        "react",
        "react-dom",
        "react-router-dom",
        "lucide-react",
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
  }
})
