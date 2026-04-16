import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import federation from "@originjs/vite-plugin-federation"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "")

  const required = [
    "VITE_REMOTE_AUTH", "VITE_REMOTE_HOME", "VITE_REMOTE_EMERGENCY",
    "VITE_REMOTE_HOSPITAL", "VITE_REMOTE_AMBULATORIO", "VITE_REMOTE_AUDITORIA",
    "VITE_AUTH_URL",
  ]
  for (const key of required) {
    if (!env[key]) throw new Error(`[mf-shell] Falta variable de entorno: ${key}`)
  }

  return {
  plugins: [
    react(),
    federation({
      name: "mf-shell",
      exposes: {
        "./UserContext": "./src/context/UserContext",
      },
      remotes: {
        auth:        env.VITE_REMOTE_AUTH,
        home:        env.VITE_REMOTE_HOME,
        emergency:   env.VITE_REMOTE_EMERGENCY,
        hospital:    env.VITE_REMOTE_HOSPITAL,
        ambulatorio: env.VITE_REMOTE_AMBULATORIO,
        auditoria:   env.VITE_REMOTE_AUDITORIA,
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
      "react":                path.resolve(__dirname, "../../node_modules/react/index.js"),
      "react/jsx-runtime":    path.resolve(__dirname, "../../node_modules/react/jsx-runtime.js"),
      "react/jsx-dev-runtime":path.resolve(__dirname, "../../node_modules/react/jsx-dev-runtime.js"),
      "react-dom":            path.resolve(__dirname, "../../node_modules/react-dom/index.js"),
      "react-dom/client":     path.resolve(__dirname, "../../node_modules/react-dom/client.js"),
    },
  },
  build: {
    target:       "esnext",
    minify:       false,
    cssCodeSplit: false,
  },
  server:  { port: 10500 },
  preview: { port: 10500 },
  }
})
