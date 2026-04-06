import { lazy, Suspense, type ReactNode } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"

import HomeLayout from "./HomeLayout"
import AppLayout  from "./Layout"
import { useUser } from "./context/UserContext"
import { baseColors } from "@hce/design-system"

function AppLoader() {
  return (
    <div style={{
      display:         "flex",
      flexDirection:   "column",
      alignItems:      "center",
      justifyContent:  "center",
      height:          "100vh",
      backgroundColor: baseColors.primaryLight,
      gap:             16,
    }}>
      <div style={{
        width:        48,
        height:       48,
        border:       `5px solid ${baseColors.primary}30`,
        borderTop:    `5px solid ${baseColors.primary}`,
        borderRadius: "50%",
        animation:    "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

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
