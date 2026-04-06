import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import federation from "@originjs/vite-plugin-federation"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  return {
  plugins: [
    react(),
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
        "@mui/material",
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
  server:  { port: 10502 },
  preview: { port: 10502 },
  build: { target: "esnext", minify: false, cssCodeSplit: false }
  }
})
