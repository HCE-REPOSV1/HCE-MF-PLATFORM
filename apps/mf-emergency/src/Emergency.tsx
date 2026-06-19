import { Routes, Route }         from "react-router-dom"
import { DSProvider, emergencyTheme } from "@hce/design-system"

import MonitorPage  from "./pages/MonitorPage"
import ReportsPage  from "./pages/ReportsPage"
import SettingsPage from "./pages/SettingsPage"

// ─── Router raíz del módulo Emergencia ───────────────────
// Para agregar una nueva página:
//   1. Crear src/pages/NuevaPagina.tsx
//   2. Importarla aquí y agregar <Route>
//   3. Agregar el ítem en menuConfig.ts
//
// DSProvider anidado con emergencyTheme: el shell ya envuelve
// toda la app con el DSProvider base (mf-shell/main.tsx); este
// anidado aplica la paleta/tipografía clínica solo al subárbol
// de Emergencia (headers de tabla blancos sobre azul, IBM Plex, etc.)
export default function Emergency() {
  return (
    <DSProvider theme={emergencyTheme}>
      <Routes>
        <Route index                  element={<MonitorPage />}  />
        <Route path="patients"        element={<div />}          />  {/* TODO: PatientsPage */}
        <Route path="reports"         element={<ReportsPage />}  />
        <Route path="settings"        element={<SettingsPage />} />
      </Routes>
    </DSProvider>
  )
}
