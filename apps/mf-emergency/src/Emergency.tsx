import { useEffect }      from "react"
import { Routes, Route }  from "react-router-dom"
import { injectEmergencyTokens } from "@hce/design-system"

import MonitorPage  from "./pages/MonitorPage"
import ReportsPage  from "./pages/ReportsPage"
import SettingsPage from "./pages/SettingsPage"

// ─── Router raíz del módulo Emergencia ───────────────────
// Para agregar una nueva página:
//   1. Crear src/pages/NuevaPagina.tsx
//   2. Importarla aquí y agregar <Route>
//   3. Agregar el ítem en menuConfig.ts
export default function Emergency() {
  useEffect(() => {
    injectEmergencyTokens()
  }, [])

  return (
    <Routes>
      <Route index                  element={<MonitorPage />}  />
      <Route path="patients"        element={<div />}          />  {/* TODO: PatientsPage */}
      <Route path="reports"         element={<ReportsPage />}  />
      <Route path="settings"        element={<SettingsPage />} />
    </Routes>
  )
}
