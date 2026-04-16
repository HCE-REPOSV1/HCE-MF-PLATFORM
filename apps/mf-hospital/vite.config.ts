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
      name: "mf-hospital",
      filename: "remoteEntry.js",
      remotes: {
        shell: env.VITE_REMOTE_SHELL,
      },
      exposes: {
        "./Hospital":   "./src/Hospital.tsx",
        "./menuConfig": "./src/menuConfig.ts",
      },
      shared: ["react", "react-dom", "react-router-dom", "lucide-react"],
    }),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "react":                path.resolve(__dirname, "../../node_modules/react/index.js"),
      "react/jsx-runtime":    path.resolve(__dirname, "../../node_modules/react/jsx-runtime.js"),
      "react/jsx-dev-runtime":path.resolve(__dirname, "../../node_modules/react/jsx-dev-runtime.js"),
      "react-dom":            path.resolve(__dirname, "../../node_modules/react-dom/index.js"),
      "react-dom/client":     path.resolve(__dirname, "../../node_modules/react-dom/client.js"),
    },
  },
  server:  { port: 10504 },
  preview: { port: 10504 },
  build: { target: "esnext", minify: false, cssCodeSplit: false },
  }
})
