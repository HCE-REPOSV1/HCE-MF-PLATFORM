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
        header:    "http://localhost:5101/assets/remoteEntry.js",
        navigation:"http://localhost:5102/assets/remoteEntry.js",
        home:      "http://localhost:5103/assets/remoteEntry.js",
        patient:   "http://localhost:5104/assets/remoteEntry.js",
        emergency: "http://localhost:5106/assets/remoteEntry.js"
      },
      shared: [
        "react",
        "react-dom",
        "react-router-dom",
        "lucide-react",
        "@mui/material",
        // "@mui/icons-material",
        "@emotion/react",
        "@emotion/styled",
        "@jarvis/design-system"
      ],
    })
  ],
  resolve: {
    alias: {
      "@design-system": path.resolve(
        __dirname,
        "../../packages/design-system"
      ),
      react: path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom")
    }
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 5000
  },
  preview: {
    port: 5000
  }
})

