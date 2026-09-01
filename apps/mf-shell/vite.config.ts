import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import fs from "fs";
import path from "path";

// Capturado una sola vez por build — mismo valor en el bundle y en version.json
const BUILD_TIME = new Date().toISOString();

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");

  const required = [
    "VITE_REMOTE_AUTH",
    "VITE_REMOTE_HOME",
    "VITE_REMOTE_EMERGENCY",
    "VITE_REMOTE_HOSPITAL",
    "VITE_REMOTE_AMBULATORIO",
    "VITE_REMOTE_AUDITORIA",
    "VITE_REMOTE_HEADER",
    "VITE_REMOTE_SIDEBAR",
    "VITE_REMOTE_FOOTER",
    "VITE_REMOTE_TRIAGE",
    "VITE_REMOTE_CLINICAL_RECORD",
    "VITE_APIGW_CNL_CROSS",
  ];
  for (const key of required) {
    if (!env[key])
      throw new Error(`[mf-shell] Falta variable de entorno: ${key}`);
  }

  return {
    define: {
      // Inyecta el timestamp del build en el bundle para que useVersionChecker
      // pueda compararlo con el /version.json del servidor
      __BUILD_TIME__: JSON.stringify(BUILD_TIME),
    },
    plugins: [
      react(),
      // Escribe dist/version.json al finalizar el bundle
      {
        name: "version-json",
        closeBundle() {
          const outDir = path.resolve(__dirname, "dist");
          fs.mkdirSync(outDir, { recursive: true });
          fs.writeFileSync(
            path.join(outDir, "version.json"),
            JSON.stringify({ buildTime: BUILD_TIME }),
          );
        },
      },
      federation({
        name: "mf-shell",
        exposes: {
          "./UserContext": "./src/context/UserContext",
          "./AuthService": "./src/services/auth.service",
          "./ApiClient": "./src/services/api.service",
        },
        remotes: {
          auth: `${env.VITE_REMOTE_AUTH}?v=${encodeURIComponent(BUILD_TIME)}`,
          home: `${env.VITE_REMOTE_HOME}?v=${encodeURIComponent(BUILD_TIME)}`,
          emergency: `${env.VITE_REMOTE_EMERGENCY}?v=${encodeURIComponent(BUILD_TIME)}`,
          hospital: `${env.VITE_REMOTE_HOSPITAL}?v=${encodeURIComponent(BUILD_TIME)}`,
          ambulatorio: `${env.VITE_REMOTE_AMBULATORIO}?v=${encodeURIComponent(BUILD_TIME)}`,
          auditoria: `${env.VITE_REMOTE_AUDITORIA}?v=${encodeURIComponent(BUILD_TIME)}`,
          header: `${env.VITE_REMOTE_HEADER}?v=${encodeURIComponent(BUILD_TIME)}`,
          sidebar: `${env.VITE_REMOTE_SIDEBAR}?v=${encodeURIComponent(BUILD_TIME)}`,
          footer: `${env.VITE_REMOTE_FOOTER}?v=${encodeURIComponent(BUILD_TIME)}`,
          triage: `${env.VITE_REMOTE_TRIAGE}?v=${encodeURIComponent(BUILD_TIME)}`,
          clinicalRecord: `${env.VITE_REMOTE_CLINICAL_RECORD}?v=${encodeURIComponent(BUILD_TIME)}`,
        },
        shared: [
          "react",
          "react-dom",
          "react-router-dom",
          "lucide-react",
          "@emotion/react",
          "@emotion/styled",
          "@hce/design-system",
          "i18next",
          "react-i18next",
          "@hce/i18n-core",
        ],
      }),
    ],
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    build: {
      target: "esnext",
      minify: false,
      cssCodeSplit: false,
    },
    server: { port: 10500 },
    preview: { port: 10500 },
  };
});
