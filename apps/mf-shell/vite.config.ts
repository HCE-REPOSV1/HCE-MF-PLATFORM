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
        header: "http://localhost:5001/assets/remoteEntry.js",
        navigation: "http://localhost:5002/assets/remoteEntry.js",
        home: "http://localhost:5003/assets/remoteEntry.js",
        patient: "http://localhost:5004/assets/remoteEntry.js"
      },
      shared: ["react", "react-dom"]
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
  server: {
    port: 5000
  },
  preview: {
    port: 5000
  }
})

