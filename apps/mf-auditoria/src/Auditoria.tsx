import { Routes, Route } from "react-router-dom"

import DashboardPage  from "./pages/DashboardPage"
import AuditoriasPage from "./pages/AuditoriasPage"
import ReportsPage    from "./pages/ReportsPage"

// ─── Router raíz del módulo Auditoría ────────────────────
// Para agregar una nueva página:
//   1. Crear src/pages/NuevaPagina.tsx
//   2. Importarla aquí y agregar <Route>
//   3. Agregar el ítem en menuConfig.ts
export default function Auditoria() {
  return (
    <Routes>
      <Route index              element={<DashboardPage />}  />
      <Route path="auditorias"  element={<AuditoriasPage />} />
      <Route path="reports"     element={<ReportsPage />}    />
    </Routes>
  )
}
