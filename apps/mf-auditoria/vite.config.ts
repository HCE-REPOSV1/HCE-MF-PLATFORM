import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import federation from "@originjs/vite-plugin-federation"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "")
  return {
  plugins: [
    react(),
    federation({
      name: "mf-auditoria",
      filename: "remoteEntry.js",
      remotes: {
        shell: env.VITE_REMOTE_SHELL,
      },
      exposes: {
        "./Auditoria":  "./src/Auditoria.tsx",
        "./menuConfig": "./src/menuConfig.ts",
      },
      shared: ["react", "react-dom", "react-router-dom", "lucide-react"],
    }),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "react":     path.resolve(__dirname, "../../node_modules/react"),
      "react-dom": path.resolve(__dirname, "../../node_modules/react-dom"),
    },
  },
  server:  { port: 10506 },
  preview: { port: 10506 },
  build: { target: "esnext", minify: false, cssCodeSplit: false },
  }
})
