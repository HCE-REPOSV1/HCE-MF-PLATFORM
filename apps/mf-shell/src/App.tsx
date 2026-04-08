import { lazy, Suspense, type ReactNode } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"

import HomeLayout from "./HomeLayout"
import AppLayout  from "./Layout"
import { useUser } from "./context/UserContext"
import { LoadingOverlay } from "@hce/design-system"

const AppLoader = () => <LoadingOverlay open />

const Login       = lazy(() => import("auth/Login"))
const Home        = lazy(() => import("home/Home"))
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
    <Suspense fallback={<AppLoader />}>
      <Routes>

        {/* Pública — redirige al home si ya hay sesión */}
        <Route path="/" element={
          <PublicRoute><LoginPage /></PublicRoute>
        } />

        {/* Hub — header sin sidebar */}
        <Route element={<ProtectedRoute><HomeLayout /></ProtectedRoute>}>
          <Route path="/home" element={<Home />} />
        </Route>

        {/* Módulos — header + sidebar dinámico */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/emergency/*"   element={<Emergency />} />
          <Route path="/hospital/*"    element={<Hospital />} />
          <Route path="/ambulatorio/*" element={<Ambulatorio />} />
          <Route path="/auditoria/*"   element={<Auditoria />} />
        </Route>

        {/* Cualquier ruta desconocida → login */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Suspense>
  )
}
