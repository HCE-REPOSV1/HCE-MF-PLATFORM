import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import federation from "@originjs/vite-plugin-federation"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "")
  return {
  // Las URLs de assets deben ser absolutas para que el shell (otro origen)
  // pueda resolverlas correctamente (Module Federation cross-origin asset fix).
  // VITE_BASE_URL se setea en .env — por defecto localhost para dev/docker local.
  base: env.VITE_BASE_URL || "http://localhost:10502",
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
      "react":                path.resolve(__dirname, "../../node_modules/react/index.js"),
      "react/jsx-runtime":    path.resolve(__dirname, "../../node_modules/react/jsx-runtime.js"),
      "react/jsx-dev-runtime":path.resolve(__dirname, "../../node_modules/react/jsx-dev-runtime.js"),
      "react-dom":            path.resolve(__dirname, "../../node_modules/react-dom/index.js"),
      "react-dom/client":     path.resolve(__dirname, "../../node_modules/react-dom/client.js"),
    }
  },
  server:  { port: 10502 },
  preview: { port: 10502 },
  build: { target: "esnext", minify: false, cssCodeSplit: false }
  }
})
