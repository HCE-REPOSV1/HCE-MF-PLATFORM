import { Routes, Route, Navigate } from "react-router-dom";
import { DSProvider, emergencyTheme } from "@hce/design-system";
import type { ReactNode } from "react";

import MonitorPage from "./pages/MonitorPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import { usePermiso } from "./hooks/usePermiso";
import { PERMISOS_EMERGENCY } from "./config/permisos";
import ClinicalRecordPage from "./pages/ClinicalRecordPage";

function PermisoRoute({
  codigo,
  children,
}: {
  codigo: string;
  children: ReactNode;
}) {
  const permitido = usePermiso(codigo);
  if (!permitido) return <Navigate to="/emergencia" replace />;
  return <>{children}</>;
}

// ─── Router raíz del módulo Emergencia ───────────────────
// Para agregar una nueva página:
//   1. Crear src/pages/NuevaPagina.tsx
//   2. Importarla aquí y agregar <Route> con PermisoRoute
//   3. Agregar el ítem en menuConfig.ts y en permisos.ts
export default function Emergency() {
  return (
    <DSProvider theme={emergencyTheme}>
      <Routes>
        <Route index element={<MonitorPage />} />
        <Route path="patients" element={<div />} /> {/* TODO: PatientsPage */}
        <Route
          path="historiacli"
          element={
            <PermisoRoute codigo={PERMISOS_EMERGENCY.clinicalRecord}>
              <ClinicalRecordPage></ClinicalRecordPage>
            </PermisoRoute>
          }
        />
        <Route
          path="reports"
          element={
            <PermisoRoute codigo={PERMISOS_EMERGENCY.reports}>
              <ReportsPage />
            </PermisoRoute>
          }
        />
        <Route
          path="settings"
          element={
            <PermisoRoute codigo={PERMISOS_EMERGENCY.settings}>
              <SettingsPage />
            </PermisoRoute>
          }
        />
      </Routes>
    </DSProvider>
  );
}
