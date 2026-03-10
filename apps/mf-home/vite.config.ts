import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import federation from "@originjs/vite-plugin-federation"

export default defineConfig({
  plugins: [
    react(),
    federation({
      name:"mf-home",
      filename:"remoteEntry.js",
      exposes:{
        "./Home":"./src/Home.tsx"
      },
      shared:["react","react-dom"]
    })
  ],
  server: {
    port: 5103
  },
  preview: {
    port: 5103
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false
  }
})  