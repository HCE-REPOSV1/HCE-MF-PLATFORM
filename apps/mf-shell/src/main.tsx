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
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { DSProvider } from "@jarvis/design-system/provider/ThemeProvider"
import App from "./App"
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