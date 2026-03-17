import { Routes, Route } from "react-router-dom"

import AgendaPage    from "./pages/AgendaPage"
import ConsultasPage from "./pages/ConsultasPage"
import ReportsPage   from "./pages/ReportsPage"

// ─── Router raíz del módulo Ambulatorio ──────────────────
// Para agregar una nueva página:
//   1. Crear src/pages/NuevaPagina.tsx
//   2. Importarla aquí y agregar <Route>
//   3. Agregar el ítem en menuConfig.ts
export default function Ambulatorio() {
  return (
    <Routes>
      <Route index            element={<AgendaPage />}    />
      <Route path="consultas" element={<ConsultasPage />} />
      <Route path="reports"   element={<ReportsPage />}   />
    </Routes>
  )
}
