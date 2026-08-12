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
import {
  companyThemes,
  DSProvider,
  injectHceFonts,
  injectHceTokens,
  type CompanyThemeKey,
} from "@hce/design-system"
import { UserProvider } from "./context/UserContext"
import App from "./App"
import { initI18n } from "@hce/i18n-core"

// Inyecta los CSS custom properties del Design System base en :root
injectHceTokens()
injectHceFonts()
initI18n({ defaultLocale: import.meta.env.VITE_DEFAULT_LOCALE })

// El tenant se configura por despliegue desde apps/mf-shell/.env.
// Una clave ausente conserva el tema default; una clave desconocida utiliza
// deliberadamente el fallback "unknown" para hacer visible la configuración.
const configuredTheme = import.meta.env.VITE_COMPANY_THEME?.trim().toLowerCase()
const companyTheme: CompanyThemeKey = !configuredTheme
  ? "default"
  : configuredTheme in companyThemes
    ? configuredTheme as CompanyThemeKey
    : "unknown"

if (configuredTheme && companyTheme === "unknown" && configuredTheme !== "unknown") {
  console.warn(
    `[mf-shell] VITE_COMPANY_THEME="${configuredTheme}" no está registrado; se usará el tema "unknown".`,
  )
}

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
 <DSProvider theme={companyTheme}>
    <UserProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </UserProvider>
 </DSProvider>
)
