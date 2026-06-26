import { Routes, Route, Navigate } from "react-router-dom"
import type { ReactNode } from "react"

import DashboardPage  from "./pages/DashboardPage"
import AuditoriasPage from "./pages/AuditoriasPage"
import ReportsPage    from "./pages/ReportsPage"
import { usePermiso } from "./hooks/usePermiso"
import { PERMISOS_AUDITORIA } from "./config/permisos"

function PermisoRoute({ codigo, children }: { codigo: string; children: ReactNode }) {
  const permitido = usePermiso(codigo)
  if (!permitido) return <Navigate to="/auditoria" replace />
  return <>{children}</>
}

// ─── Router raíz del módulo Auditoría ────────────────────
// Para agregar una nueva página:
//   1. Crear src/pages/NuevaPagina.tsx
//   2. Importarla aquí y agregar <Route> con PermisoRoute
//   3. Agregar el ítem en menuConfig.ts y en permisos.ts
export default function Auditoria() {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="auditorias"
        element={
          <PermisoRoute codigo={PERMISOS_AUDITORIA.auditorias}>
            <AuditoriasPage />
          </PermisoRoute>
        }
      />
      <Route path="reports"
        element={
          <PermisoRoute codigo={PERMISOS_AUDITORIA.reports}>
            <ReportsPage />
          </PermisoRoute>
        }
      />
    </Routes>
  )
}
