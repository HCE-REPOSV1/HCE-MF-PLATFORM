/**
 * ---------------------------------------------------------
 * Component: EmergencyMonitor
 * Description:
 * Pantalla principal del módulo Monitor de Emergencia.
 * Orquesta todos los componentes del Design System para
 * replicar la interfaz de monitoreo en tiempo real de
 * la sala de emergencias clínica.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────┐
 *   │  EmergencyHeader (título + fecha + sede)         │
 *   ├─────────────────────────────────────────────────┤
 *   │  ActionBar (filtrar, usuario, imprimir)          │
 *   ├─────────────────────────────────────────────────┤
 *   │  PatientTable (tabla sticky + filas)             │
 *   │  ← scroll vertical →                            │
 *   ├─────────────────────────────────────────────────┤
 *   │  EmergencyPagination (derecha)                  │
 *   └─────────────────────────────────────────────────┘
 *                                       │ BedsAvailabilityTab (fixed derecha)
 * ---------------------------------------------------------
 */
import { useState, useEffect, useCallback } from "react"
import { Box } from "@mui/material"
import { ThemeProvider } from "@mui/material/styles"

import { emergencyTheme }        from "@design-system/theme/emergencyTheme"
import { injectEmergencyTokens } from "@design-system/tokens/emergency.tokens"
import { emergencyTokens }       from "@design-system/tokens/emergency.tokens"

import { EmergencyHeader }     from "@design-system/molecules/EmergencyHeader/EmergencyHeader"
import { ActionBar }           from "@design-system/molecules/ActionBar/ActionBar"
import { PatientTable }        from "@design-system/molecules/PatientTable/PatientTable"
import { EmergencyPagination } from "@design-system/molecules/EmergencyPagination/EmergencyPagination"
import { BedsAvailabilityTab } from "@design-system/molecules/BedsAvailabilityTab/BedsAvailabilityTab"

import { MOCK_PATIENTS, PAGE_SIZE } from "./mock/patients.mock"
import { useDateTime } from "./hooks/useDateTime"
import type { PatientRowData } from "@design-system/molecules/PatientRow/PatientRow"

/**
 * EmergencyMonitor
 *
 * Pantalla completa del monitor de emergencia.
 * Se puede renderizar de forma standalone (dev) o
 * como microfrontend embebido en el shell (producción).
 */
export default function EmergencyMonitor() {
  const dateTime = useDateTime()

  const [currentPage,        setCurrentPage]        = useState(1)
  const [selectedPatientId,  setSelectedPatientId]  = useState<string | null>(null)
  const [bedsTabActive,      setBedsTabActive]      = useState(false)

  // Inyectar CSS custom properties del design system de emergencias
  useEffect(() => {
    injectEmergencyTokens()
  }, [])

  // ─── Paginación ──────────────────────────────────────
  const totalPages = Math.ceil(MOCK_PATIENTS.length / PAGE_SIZE)
  const paginatedRows: PatientRowData[] = MOCK_PATIENTS
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    .map((p) => ({
      ...p,
      selected: p.id === selectedPatientId,
      patient: {
        ...p.patient,
        onClick: () => handlePatientClick(p.id),
      },
      onInfo: () => handleInfo(p.id),
    }))

  // ─── Handlers ────────────────────────────────────────
  const handlePatientClick = useCallback((id: string) => {
    setSelectedPatientId((prev) => (prev === id ? null : id))
  }, [])

  const handleInfo = useCallback((id: string) => {
    const patient = MOCK_PATIENTS.find((p) => p.id === id)
    // TODO: abrir panel lateral de detalle del paciente
    console.info("[EmergencyMonitor] Info del paciente:", patient)
  }, [])

  const handleFilter = () => {
    // TODO: abrir panel de filtros
    console.info("[EmergencyMonitor] Abrir filtros")
  }

  const handleRefresh = () => {
    setCurrentPage(1)
    setSelectedPatientId(null)
    // TODO: refetch de datos desde la API
    console.info("[EmergencyMonitor] Refrescando datos...")
  }

  const handlePrint = () => {
    window.print()
  }
    interface HeaderColumn {
    label: string
    width: number
    align: "center" | "left"
  }
  const HEADER_COLUMNS: HeaderColumn[] = [
  { label: "Prioridad",  width: 70,  align: "center" },
  { label: "Box",        width: 80,  align: "center" },
  { label: "Paciente",   width: 180, align: "left"   },
  { label: "Edad",       width: 55,  align: "center" },
  { label: "Sexo",       width: 55,  align: "center" },
  { label: "N.Documento",width: 100, align: "left"   },
  { label: "Médico",     width: 160, align: "left"   },
  { label: "Lab",        width: 50,  align: "center" },
  { label: "Img",        width: 50,  align: "center" },
  { label: "Indc.Med",   width: 50,  align: "center" },
  { label: "Interc.",    width: 50,  align: "center" },
  { label: "Atención",   width: 90,  align: "left"   },
  { label: "Info",       width: 50,  align: "center" },
]

  // ─── Render ───────────────────────────────────────────
  return (
    <ThemeProvider theme={emergencyTheme}>
      <Box
        sx={{
          position:        "fixed",
          inset:           0,
          display:        "flex",
          flexDirection:  "column",
          backgroundColor: emergencyTokens.colors.rowAlternate,
          overflow:       "hidden",
          zIndex:         1,
        }}
      >
        {/* ── Header ── */}
        <EmergencyHeader
          title="Monitor de Emergencia"
          dateTime={dateTime}
          sede="Sede Central"
        />

        {/* ── Cuerpo principal ── */}
        <Box
          sx={{
            flex:           1,
            display:        "flex",
            flexDirection:  "column",
            overflow:       "hidden",
            padding:        `${emergencyTokens.spacing[3]} 52px ${emergencyTokens.spacing[3]} ${emergencyTokens.spacing[4]}`,
            gap:            emergencyTokens.spacing[3],
          }}
        >
          {/* ── Barra de acciones ── */}
          <Box
            sx={{
              borderRadius: emergencyTokens.borderRadius.lg,
              overflow:     "hidden",
              boxShadow:    emergencyTokens.shadows.card,
              flexShrink:   0,
            }}
          >
            <ActionBar
              onFilter={handleFilter}
              onRefresh={handleRefresh}
              onPrint={handlePrint}
            />
          </Box>

          {/* ── Tabla de pacientes (scroll vertical) ── */}
          <Box sx={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
            <PatientTable
              rows={paginatedRows}
              header={HEADER_COLUMNS}
              maxHeight="100%"
            />
          </Box>

          {/* ── Paginación ── */}
          <Box
            sx={{
              flexShrink:      0,
              backgroundColor: emergencyTokens.colors.surfaceBg,
              borderRadius:    emergencyTokens.borderRadius.lg,
              boxShadow:       emergencyTokens.shadows.card,
              border:          `1px solid ${emergencyTokens.colors.border}`,
            }}
          >
            <EmergencyPagination
              totalItems={MOCK_PATIENTS.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page)
                setSelectedPatientId(null)
              }}
            />
          </Box>
        </Box>

        {/* ── Tab lateral disponibilidad de camas ── */}
        <BedsAvailabilityTab
          onClick={() => setBedsTabActive((prev) => !prev)}
          isActive={bedsTabActive}
        />
      </Box>
    </ThemeProvider>
  )
}
