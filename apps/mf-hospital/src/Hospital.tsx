import { Routes, Route } from "react-router-dom"

import PanelPage      from "./pages/PanelPage"
import InternadosPage from "./pages/InternadosPage"
import QuirofanosPage from "./pages/QuirofanosPage"
import ReportsPage    from "./pages/ReportsPage"

// ─── Router raíz del módulo Hospital ─────────────────────
// Para agregar una nueva página:
//   1. Crear src/pages/NuevaPagina.tsx
//   2. Importarla aquí y agregar <Route>
//   3. Agregar el ítem en menuConfig.ts
export default function Hospital() {
  return (
    <Routes>
      <Route index             element={<PanelPage />}      />
      <Route path="internados" element={<InternadosPage />} />
      <Route path="quirofanos" element={<QuirofanosPage />} />
      <Route path="reports"    element={<ReportsPage />}    />
    </Routes>
  )
}
