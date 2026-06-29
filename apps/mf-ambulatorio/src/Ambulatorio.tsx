import { Routes, Route, Navigate } from "react-router-dom"
import type { ReactNode } from "react"

import AgendaPage    from "./pages/AgendaPage"
import ConsultasPage from "./pages/ConsultasPage"
import ReportsPage   from "./pages/ReportsPage"
import { usePermiso } from "./hooks/usePermiso"
import { PERMISOS_AMBULATORIO } from "./config/permisos"

function PermisoRoute({ codigo, children }: { codigo: string; children: ReactNode }) {
  const permitido = usePermiso(codigo)
  if (!permitido) return <Navigate to="/ambulatorio" replace />
  return <>{children}</>
}

// ─── Router raíz del módulo Ambulatorio ──────────────────
// Para agregar una nueva página:
//   1. Crear src/pages/NuevaPagina.tsx
//   2. Importarla aquí y agregar <Route> con PermisoRoute
//   3. Agregar el ítem en menuConfig.ts y en permisos.ts
export default function Ambulatorio() {
  return (
    <Routes>
      <Route index element={<AgendaPage />} />
      <Route path="consultas"
        element={
          <PermisoRoute codigo={PERMISOS_AMBULATORIO.consultas}>
            <ConsultasPage />
          </PermisoRoute>
        }
      />
      <Route path="reports"
        element={
          <PermisoRoute codigo={PERMISOS_AMBULATORIO.reports}>
            <ReportsPage />
          </PermisoRoute>
        }
      />
    </Routes>
  )
}
