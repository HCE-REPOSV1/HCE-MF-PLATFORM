import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import fs from "fs";
import path from "path";

const BUILD_TIME = new Date().toISOString();

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");

  const required = ["VITE_REMOTE_SHELL"];
  for (const key of required) {
    if (!env[key]) throw new Error(`[mf-footer] Falta variable de entorno: ${key}`);
  }

  return {
    plugins: [
      react(),
      {
        name: "version-json",
        closeBundle() {
          const outDir = path.resolve(__dirname, "dist");
          fs.writeFileSync(
            path.join(outDir, "version.json"),
            JSON.stringify({ buildTime: BUILD_TIME }),
          );
        },
      },
      federation({
        name: "mf-footer",
        filename: "remoteEntry.js",
        remotes: {
          shell: env.VITE_REMOTE_SHELL,
        },
        exposes: {
          "./Footer": "./src/Footer.tsx"
        },
        shared: [
          "react", "react-dom", "react-router-dom", "lucide-react",
          "@mui/material", "@emotion/react", "@emotion/styled", "@hce/design-system",
        ],
      }),
    ],
    resolve: {
    dedupe: ["react", "react-dom"],
    },
     server:  { port: 10509 },
    preview: { port: 10509 },
    build: { target: "esnext", minify: false, cssCodeSplit: false },
  };
});
