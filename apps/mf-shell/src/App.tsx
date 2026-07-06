import { lazy, Suspense, type ReactNode } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"

import AppLayout from "./Layout"
import { useUser } from "./context/UserContext"
import { UpdateNotification } from "./components/UpdateNotification"
import { CSFLoading } from "@hce/design-system"
import HomeRoutes from "./routes/HomeRoutes"

const AppLoader = () => <CSFLoading open overlay message="Cargando pantallas ..." frameDuration={100} />

const Login       = lazy(() => import("auth/Login"))
const Home        = lazy(() => import("home/Home"))
const EmergencyTV = lazy(() => import("emergency/EmergencyTV"))
const Emergency   = lazy(() => import("emergency/Emergency"))
const Hospital    = lazy(() => import("hospital/Hospital"))
const Ambulatorio = lazy(() => import("ambulatorio/Ambulatorio"))
const Auditoria   = lazy(() => import("auditoria/Auditoria"))

// ─── Ruta pública: si ya está autenticado redirige al home ──
function PublicRoute({ children }: { children: ReactNode }) {
  const { user } = useUser()
  if (user) return <Navigate to="/home" replace />
  return <>{children}</>
}

// ─── Ruta protegida: si no está autenticado redirige al login ─
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useUser()
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

// ─── Páginas ─────────────────────────────────────────────────
function LoginPage() {
  const navigate             = useNavigate()
  const { refetch, setSede } = useUser()

  const handleSuccess = async (sede: string) => {
    setSede(sede)
    await refetch()
    navigate("/home", { replace: true })
  }

  return (
    <Suspense fallback={null}>
      <Login onSuccess={handleSuccess} />
    </Suspense>
  )
}

// ─────────────────────────────────────────────────────────────
export default function App() {
  const { loading } = useUser()

  if (loading) return <AppLoader />

  return (
    <>
      <UpdateNotification />
      <Suspense fallback={<AppLoader />}>
      <Routes>

        {/* Pública — redirige al home si ya hay sesión */}
        <Route path="/" element={
          <PublicRoute>
            
            <LoginPage />
            
            </PublicRoute>
        } />

        <Route path="/emergency/emergencyTV/:sedeId"  element={<EmergencyTV />} />

        {/* Rutas protegidas — layout único con sidebar flotante */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>

         <Route path="/home" element={<HomeRoutes />}>
             <Route index element={<Home />} />
         
              <Route path="emergencia/*" element={<Emergency />} />
              <Route path="hospital/*" element={<Hospital />} />
              <Route path="ambulatorio/*" element={<Ambulatorio />} />
              <Route path="auditoria/*" element={<Auditoria />} />

          </Route>
        </Route>

        {/* Cualquier ruta desconocida → login */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Suspense>
    </>
  )
}
