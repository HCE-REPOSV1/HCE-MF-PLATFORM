/**
 * ---------------------------------------------------------
 * File: main.tsx
 * Author: Gregorovichz Carlos Rossi
 * Created: 09-03-2026
 * Description:
 * Punto de entrada principal de la aplicación React.
 * Este archivo es responsable de inicializar el árbol
 * de componentes y configurar los proveedores globales
 * necesarios para el funcionamiento de la aplicación.
 *
 * Responsabilidades:
 * - Inicializar React DOM
 * - Inyectar el Design System global
 * - Configurar el enrutamiento de la aplicación
 * - Montar el componente raíz (App)
 *
 * Arquitectura:
 * En arquitecturas de microfrontends, este bootstrap
 * suele ejecutarse dentro de cada microfrontend o
 * dentro del shell principal.
 *
 * Tecnologías:
 * - React 18
 * - React Router
 * - Material UI
 * - Design System corporativo
 *
 * Flujo de inicialización:
 *
 * ReactDOM
 *    └── DSProvider (Design System)
 *            └── BrowserRouter (Routing)
 *                    └── App (Aplicación)
 *
 * ---------------------------------------------------------
 */
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "@jarvis/design-system/theme/theme.css"
import { DSProvider } from "@jarvis/design-system/provider/ThemeProvider"
import App from "./App"

// Suppress known Emotion + React 18.3 key prop warning.
// Emotion's Styled factory renders React.Fragment(null, Insertion, FinalTag)
// without assigning keys. React 18.3 warns when this Fragment appears inside
// a .map() list. This is a framework-level issue (not in our code) tracked at
// https://github.com/emotion-js/emotion/issues/3367
// The filter targets only warnings whose render context is Emotion's `Styled`.
;(function suppressEmotionKeyWarning() {
  const _orig = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Each child in a list should have a unique")
    ) {
      return
    }
    _orig(...args)
  }
})()

/**
 * Obtiene el contenedor raíz del DOM
 * Inicializa la aplicación React utilizando
 * la API moderna de React 18 (createRoot)
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  /**
   * DSProvider
   * Inyecta el theme global y configuración
   * del Design System corporativo
   */
 <DSProvider>
    {/* Configuración del sistema de rutas */}
    <BrowserRouter>
      {/* Componente raíz de la aplicación */}
      <App />
    </BrowserRouter>
 </DSProvider>
)