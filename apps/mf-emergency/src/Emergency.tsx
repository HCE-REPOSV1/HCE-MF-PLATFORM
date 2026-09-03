import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, type ReactNode } from "react";

import MonitorPage from "./pages/MonitorPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import { usePermiso } from "./hooks/usePermiso";
import { PERMISOS_EMERGENCY } from "./config/permisos";
import type { MonitorTableRow } from "./types/monitor.table.types";

function PermisoRoute({
  codigo,
  children,
}: {
  codigo: string;
  children: ReactNode;
}) {
  const permitido = usePermiso(codigo);
  if (!permitido) return <Navigate to="/home/emergencia" replace />;
  return <>{children}</>;
}

function RequireNavigatedPatient({ children }: { children: ReactNode }) {
  const { state } = useLocation();
  const encounterId = (state as { patient?: MonitorTableRow } | null)
    ?.patient?.encounter_id;

  if (encounterId == null) {
    return <Navigate to="/home/emergencia" replace />;
  }

  return <>{children}</>;
}

const ClinicalRecord = lazy(() => import("clinicalRecord/ClinicalRecord"));

export default function Emergency() {
  return (
    <Routes>
      <Route index element={<MonitorPage />} />
      <Route path="patients" element={<div />} />
      <Route
        path="historiacli"
        element={
          <PermisoRoute codigo={PERMISOS_EMERGENCY.clinicalRecord}>
            <RequireNavigatedPatient>
              <ClinicalRecord />
            </RequireNavigatedPatient>
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
  );
}