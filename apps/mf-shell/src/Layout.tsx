/**
 * ---------------------------------------------------------
 * Component: Layout
 * Author: Gregorovichz Carlos Rossi
 * Created: 09-03-2026
 * Description:
 * Layout principal de la aplicación encargado de orquestar
 * los distintos microfrontends que conforman la interfaz
 * de usuario dentro del Shell.
 *
 * Patrón de carga:
 * - Header y Navigation: import estático (siempre presentes)
 * - Home, Patient, Emergency: React.lazy (carga bajo demanda)
 *
 * Con React.lazy + Suspense, si un remote no está disponible
 * solo falla esa ruta — el resto del shell sigue funcionando.
 *
 * Rutas fullscreen (sin shell header ni nav lateral):
 * - /emergency → El Monitor de Emergencia gestiona su propio header
 *
 * Tecnologías:
 * - React
 * - React Router
 * - Module Federation
 * - Microfrontend Architecture
 * ---------------------------------------------------------
 */
import { lazy, Suspense, Component } from "react"
import type { ReactNode } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import Header     from "header/Header"
import Navigation from "navigation/Navigation"

// Carga lazy: cada MF se descarga solo cuando se navega a su ruta
const Home      = lazy(() => import("home/Home"))
const Patient   = lazy(() => import("patient/Patient"))
const Emergency = lazy(() => import("emergency/Emergency"))

/** Rutas que ocupan toda la pantalla (sin shell header ni nav) */
const FULLSCREEN_ROUTES = ["/emergency"]

// ─── Fallback de carga ────────────────────────────────────
const PageLoader = () => (
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    minHeight: 200,
    color: "#5A6A85",
    fontFamily: "IBM Plex Sans, Roboto, sans-serif",
    fontSize: 14,
  }}>
    Cargando módulo...
  </div>
)

// ─── Error Boundary (captura fallos de carga de remotes) ──
interface EBState { hasError: boolean; name: string }
class RemoteErrorBoundary extends Component<{ children: ReactNode; name: string }, EBState> {
  state: EBState = { hasError: false, name: "" }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 24,
          color: "#E53E3E",
          fontFamily: "IBM Plex Sans, Roboto, sans-serif",
          fontSize: 13,
        }}>
          ⚠ No se pudo cargar el módulo <strong>{this.props.name}</strong>.
          <br />
          Asegurate de que esté corriendo con <code>npm run preview</code>.
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Wrapper combinado Suspense + ErrorBoundary ───────────
const RemoteModule = ({ children, name }: { children: ReactNode; name: string }) => (
  <RemoteErrorBoundary name={name}>
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </RemoteErrorBoundary>
)

// ─── Layout ───────────────────────────────────────────────
export default function Layout() {
  const location  = useLocation()
  const isFullscreen = FULLSCREEN_ROUTES.includes(location.pathname)

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>

      {/* Header del shell — oculto en rutas fullscreen */}
      {!isFullscreen && <Header />}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Navegación lateral — oculta en rutas fullscreen */}
        {!isFullscreen && <Navigation />}

        {/* Área de contenido */}
        <div style={{
          padding:        isFullscreen ? 0 : 20,
          flex:           1,
          overflow:       "hidden",
          display:        "flex",
          flexDirection:  "column",
        }}>
          <Routes>
            <Route path="/home" element={
              <RemoteModule name="mf-home">
                <Home />
              </RemoteModule>
            } />

            <Route path="/patient" element={
              <RemoteModule name="mf-patient">
                <Patient />
              </RemoteModule>
            } />

            <Route path="/emergency" element={
              <RemoteModule name="mf-emergency">
                <Emergency />
              </RemoteModule>
            } />
          </Routes>
        </div>
      </div>
    </div>
  )
}
