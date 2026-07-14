import { Routes, Route, Navigate } from "react-router-dom"
import { DSProvider, emergencyTheme, hceUi } from "@hce/design-system"
import { createTheme } from "@mui/material/styles"
import type { ReactNode } from "react"

import MonitorPage  from "./pages/MonitorPage"
import ReportsPage  from "./pages/ReportsPage"
import SettingsPage from "./pages/SettingsPage"
import { usePermiso } from "./hooks/usePermiso"
import { PERMISOS_EMERGENCY } from "./config/permisos"

// ─── Override local temporal: borde de tabla del Monitor de Emergencia ───
// El theme base del design system (theme.ts, heredado por emergencyTheme)
// fuerza `borderRadius: xl` + `overflow: hidden` en TODO <Table> vía
// `MuiTable.styleOverrides.root`. GenericTable (@hce/design-system) separa
// el header y el body en dos <Table> independientes para poder fijar el
// header con scroll propio, así que ese radius global termina redondeando
// también la esquina INTERNA (abajo del header / arriba de la primera fila
// del body), rompiendo la continuidad visual — y no hay ningún borde
// perimetral visible alrededor de la tabla.
//
// El fix correcto ya está aplicado en GenericTable.tsx dentro del repo
// HCE-DESIGN-SYSTEM (sx explícito por Table: radius 0 en las esquinas
// internas + radius solo en las externas, borde perimetral propio en el
// Box que envuelve header+body), pero ese repo se consume acá como
// dependencia versionada publicada a Verdaccio — ese fix no se verá en
// mf-emergency hasta hacer `publish:local` + bump de versión en
// @hce/design-system, algo que no se puede ejecutar en este entorno.
//
// Mientras tanto, como GenericTable es el único consumidor de <Table> /
// <TableContainer> dentro de mf-emergency (verificado: no hay ningún otro
// <Table> nativo de MUI en esta app), es seguro aproximar el mismo
// resultado acá vía theme, con efecto inmediato y sin requerir publish:
//   - se anula el borderRadius global (mata el redondeo indebido en la
//     esquina interna del seam header/primera-fila),
//   - se agrega un borde perimetral 1px del mismo color que el header
//     (hceUi.textPrimaryTable — el token real que pinta el fondo del
//     header en headerCellSx, NO hceClinicalColors.tableHeaderBg/headerBg,
//     que son tokens de azul similares pero no son los que se renderizan).
// Esta aproximación no es idéntica pixel-a-pixel al fix del design system
// (al aplicarse a los dos <Table> del componente, el borde queda duplicado
// como una línea ~2px en el seam header/body en vez de invisible, y las
// esquinas externas quedan cuadradas en vez de redondeadas), pero corrige
// el defecto visible reportado sin tocar ningún otro componente de la app.
// Quitar este bloque una vez publicada y bumpeada la versión del design
// system con el fix nativo.
const emergencyThemeWithTableBorderFix = createTheme(emergencyTheme, {
  components: {
    MuiTable: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1px solid ${hceUi.textPrimaryTable}`,
        },
      },
    },
  },
})

function PermisoRoute({ codigo, children }: { codigo: string; children: ReactNode }) {
  const permitido = usePermiso(codigo)
  if (!permitido) return <Navigate to="/emergencia" replace />
  return <>{children}</>
}

// ─── Router raíz del módulo Emergencia ───────────────────
// Para agregar una nueva página:
//   1. Crear src/pages/NuevaPagina.tsx
//   2. Importarla aquí y agregar <Route> con PermisoRoute
//   3. Agregar el ítem en menuConfig.ts y en permisos.ts
export default function Emergency() {
  return (
    <DSProvider theme={emergencyThemeWithTableBorderFix}>
      <Routes>
        <Route index           element={<MonitorPage />} />
        <Route path="patients" element={<div />}         />  {/* TODO: PatientsPage */}
        <Route path="reports"
          element={
            <PermisoRoute codigo={PERMISOS_EMERGENCY.reports}>
              <ReportsPage />
            </PermisoRoute>
          }
        />
        <Route path="settings"
          element={
            <PermisoRoute codigo={PERMISOS_EMERGENCY.settings}>
              <SettingsPage />
            </PermisoRoute>
          }
        />
      </Routes>
    </DSProvider>
  )
}
