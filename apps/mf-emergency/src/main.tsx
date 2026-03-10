/**
 * ---------------------------------------------------------
 * File: main.tsx
 * Description:
 * Entry point standalone del microfrontend mf-emergency.
 * Permite ejecutar el Monitor de Emergencia de forma
 * independiente durante el desarrollo (npm run dev).
 *
 * En producción, este microfrontend es consumido por
 * el mf-shell vía Module Federation.
 * ---------------------------------------------------------
 */
import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
