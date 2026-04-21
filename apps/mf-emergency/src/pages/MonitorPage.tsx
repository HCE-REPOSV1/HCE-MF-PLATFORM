import { useState, useCallback } from "react"
import {
  Box,
  emergencyTokens,
  MonitoActionBar,
  PatientTable,
  ActionBar,
  EmergencyPagination,
  BedAvailabilityDrawer,
} from "@hce/design-system"
import { MOCK_PATIENTS, PAGE_SIZE } from "../mock/patients.mock"
import { TriajeModal }          from "../components/TriajeModal"
import { AsignarMedicoModal }   from "../components/AsignarMedicoModal"
import type { PatientRowData }  from "@hce/design-system"
import type { Medico }          from "../mock/medicos.mock"

interface HeaderColumn {
  label: string
  width: number
  align: "center" | "left"
}

const HEADER_COLUMNS: HeaderColumn[] = [
  { label: "Prioridad",   width: 70,  align: "center" },
  { label: "Box",         width: 80,  align: "center" },
  { label: "Paciente",    width: 180, align: "left"   },
  { label: "Edad",        width: 55,  align: "center" },
  { label: "Sexo",        width: 55,  align: "center" },
  { label: "N.Documento", width: 100, align: "left"   },
  { label: "Médico",      width: 160, align: "left"   },
  { label: "Lab",         width: 50,  align: "center" },
  { label: "Img",         width: 50,  align: "center" },
  { label: "Indc.Med",    width: 50,  align: "center" },
  { label: "Interc.",     width: 50,  align: "center" },
  { label: "Atención",    width: 90,  align: "left"   },
  { label: "Info",        width: 50,  align: "center" },
]

export default function MonitorPage() {
  const [currentPage,       setCurrentPage]       = useState(1)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [triajeOpen,        setTriajeOpen]         = useState(false)
  const [medicoOpen,        setMedicoOpen]         = useState(false)

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

  const handlePatientClick = useCallback((id: string) => {
    setSelectedPatientId((prev) => (prev === id ? null : id))
  }, [])

  const handleInfo = useCallback((id: string) => {
    const patient = MOCK_PATIENTS.find((p) => p.id === id)
    console.info("[MonitorPage] Info del paciente:", patient)
  }, [])

  //const handleRefresh = () => { setCurrentPage(1); setSelectedPatientId(null) }

  return (
    <>
      <Box
        sx={{
          inset:           0,
          display:         "flex",
          flexDirection:   "column",
          backgroundColor: emergencyTokens.colors.rowAlternate,
          overflow:        "hidden",
          zIndex:          1,
        }}
      >
        <Box
          sx={{
            flex:          1,
            display:       "flex",
            flexDirection: "column",
            overflow:      "hidden",
            padding:       `${emergencyTokens.spacing[3]} 52px ${emergencyTokens.spacing[3]} ${emergencyTokens.spacing[4]}`,
            gap:           emergencyTokens.spacing[3],
          }}
        >
          {/* Barra de acciones de monitoreo — ancho completo, iconos a la izquierda */}
          <Box sx={{ flexShrink: 0 }}>
            <ActionBar/>
            <MonitoActionBar
              tooltipPlacement="bottom"
              orientation="horizontal"
              onTriaje={() => setTriajeOpen(true)}
              onAsignarMedicos={() => setMedicoOpen(true)}
              onReportes={() => console.info("[MonitorPage] Reportes")}
              onDisponibilidad={() => console.info("[MonitorPage] Disponibilidad de camas")}
            />
          </Box>

          <Box sx={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
            <PatientTable rows={paginatedRows} header={HEADER_COLUMNS} />
          </Box>

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
              onPageChange={(page) => { setCurrentPage(page); setSelectedPatientId(null) }}
            />
          </Box>
        </Box>
      </Box>

      <BedAvailabilityDrawer />

      {/* Modal de Triaje */}
      <TriajeModal
        open={triajeOpen}
        onClose={() => setTriajeOpen(false)}
        onGuardar={(form) => {
          console.info("[MonitorPage] Triaje guardado:", form)
          // TODO: llamar a POST /api/triaje con los datos del form
        }}
      />

      {/* Modal de Asignar Médico */}
      <AsignarMedicoModal
        open={medicoOpen}
        onClose={() => setMedicoOpen(false)}
        paciente={selectedPatientId
          ? MOCK_PATIENTS.find(p => p.id === selectedPatientId)?.patient.name
          : undefined}
        onAsignar={(medico: Medico) => {
          console.info("[MonitorPage] Médico asignado:", medico)
          // TODO: llamar a POST /api/pacientes/{selectedPatientId}/medico con medico.id
        }}
      />
    </>
  )
}
