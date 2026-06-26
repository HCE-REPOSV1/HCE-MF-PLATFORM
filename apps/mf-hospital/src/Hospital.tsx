import { Routes, Route, Navigate } from "react-router-dom"
import type { ReactNode } from "react"

import PanelPage      from "./pages/PanelPage"
import InternadosPage from "./pages/InternadosPage"
import QuirofanosPage from "./pages/QuirofanosPage"
import ReportsPage    from "./pages/ReportsPage"
import { usePermiso } from "./hooks/usePermiso"
import { PERMISOS_HOSPITAL } from "./config/permisos"

function PermisoRoute({ codigo, children }: { codigo: string; children: ReactNode }) {
  const permitido = usePermiso(codigo)
  if (!permitido) return <Navigate to="/hospital" replace />
  return <>{children}</>
}

// ─── Router raíz del módulo Hospital ─────────────────────
// Para agregar una nueva página:
//   1. Crear src/pages/NuevaPagina.tsx
//   2. Importarla aquí y agregar <Route> con PermisoRoute
//   3. Agregar el ítem en menuConfig.ts y en permisos.ts
export default function Hospital() {
  return (
    <Routes>
      <Route index element={<PanelPage />} />
      <Route path="internados"
        element={
          <PermisoRoute codigo={PERMISOS_HOSPITAL.internados}>
            <InternadosPage />
          </PermisoRoute>
        }
      />
      <Route path="quirofanos"
        element={
          <PermisoRoute codigo={PERMISOS_HOSPITAL.quirofanos}>
            <QuirofanosPage />
          </PermisoRoute>
        }
      />
      <Route path="reports"
        element={
          <PermisoRoute codigo={PERMISOS_HOSPITAL.reports}>
            <ReportsPage />
          </PermisoRoute>
        }
      />
    </Routes>
  )
}
