import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import federation from "@originjs/vite-plugin-federation"
import fs from "fs"
import path from "path"

const BUILD_TIME = new Date().toISOString()

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "")
  return {
  // Las URLs de assets deben ser absolutas para que el shell (otro origen)
  // pueda resolverlas correctamente (Module Federation cross-origin asset fix).
  // VITE_BASE_URL se setea en .env — por defecto localhost para dev/docker local.
  base: env.VITE_BASE_URL || "http://localhost:10502",
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
      name:"mf-home",
      filename:"remoteEntry.js",
      remotes: {
        shell: env.VITE_REMOTE_SHELL,
      },
      exposes:{
        "./Home":"./src/Home.tsx"
      },
      shared: [
        "react",
        "react-dom",
        "react-router-dom",
        "lucide-react",
        "@emotion/react",
        "@emotion/styled",
        "@hce/design-system"
      ],
    })
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server:  { port: 10502 },
  preview: { port: 10502 },
  build: { target: "esnext", minify: false, cssCodeSplit: false }
  }
})
