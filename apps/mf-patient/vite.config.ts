import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import federation from "@originjs/vite-plugin-federation"

export default defineConfig({
  plugins: [
    react(),
    federation({
      name:"mf-patient",
      filename:"remoteEntry.js",
      exposes:{
        "./Patient":"./src/Patient.tsx"
      },
      shared:["react","react-dom"]
    })
  ],
  server: {
    port: 5104
  },
  preview: {
    port: 5104
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false
  }
})  