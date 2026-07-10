
import { useEmergencyMonitor } from "../hooks/useEmergencyMonitor";
import { useState, useCallback, lazy, Suspense, useMemo } from "react";
import {
  Box,
  hceClinicalColors,
  hceSpacing,
  hceBorderRadius,
  hceShadows,
  MonitoActionBar,
  EmergencyPagination,
  BedAvailabilityDrawerV2,
  HceModal,

} from "@hce/design-system";

import { AsignarMedicoModal } from "../components/AsignarMedicoModal";
import { AditionalInfoModal } from "../components/AditionalInfoModal";
import { useBedBoard } from "../hooks/useBedBoard";
import { mapBedApiItemToAvailabilityItem } from "../mapper/bed.mapper";

import {  UiWarningIcon, type GenericTableColumn } from "@hce/design-system";

import { usePermiso } from "../hooks/usePermiso";
import { PERMISOS_EMERGENCY } from "../config/permisos";
import { useSede } from "../hooks/useSede";

import type { TriajeForm } from "triage/Triage";
import {GenericTable} from "@hce/design-system";



import type { MonitorSummary, MonitorTableRow } from "../types/monitor.table.types"
import type { MonitorApiResponse } from "../types/monitor.api.types";
import { mapMonitorApiItemToTableRow, mapMonitorApiSummaryToSummary } from "../mapper/monitor.mapper";
import { monitorSortComparator } from "../../src/utils/monitorSort"
import { BoxModal } from "../components/BoxModal";


const PAGE_SIZE = 10



 const createMonitorDskColumns = ({
  canReadTriage,
  canEditBox,
  canReadHce,
  canReadInfo,
  onOpenTriage,
  onOpenHce,
  onOpenBox,
  onOpenInfo,
}: {
  canReadTriage: boolean
  canEditBox: boolean
  canReadHce: boolean
  canReadInfo: boolean
  onOpenTriage: (row: MonitorTableRow) => void
  onOpenHce: (row: MonitorTableRow) => void
  onOpenBox: (row: MonitorTableRow) => void
  onOpenInfo: (row: MonitorTableRow) => void
}): GenericTableColumn<MonitorTableRow>[] => [
  {
    key: "priority",
    header: "Prioridad",
    type: "priority",
    field: "priority",
    width: 70,
    align: "center",
    clickable: true,
    // Solo se puede abrir el triaje (modo lectura) desde este campo, y solo si la fila
    // ya tiene un triage_id vinculado — sin eso no hay nada que cargar.
    disabledGetter: (row) => !canReadTriage || row.triage_id == null || row.priority=='none',
    onClick: (row) => onOpenTriage(row),
  },
  {
    key: "box",
    header: "Box",
    type: "box",
    field: "box",
    width: 80,
    align: "center",
    clickable: true,
    disabledGetter: () => !canEditBox,
    onClick: (row) => onOpenBox(row),
  },
  {
    key: "document",
    header: "N.Documento",
    type: "text",
    width: 100,
    valueGetter: (row) =>
      row.is_vip ? row.document_number_masked : row.document_number,
    boldGetter: (row) => row.has_discharge,
  },
  {
    key: "patient",
    header: "Paciente",
    type: "patient-name",
    width: 180,
    align: "left",
    clickable: true,
    valueGetter: (row) =>
      row.is_vip ? row.patient_name_masked : row.patient_name,
    disabledGetter: (row) => !canReadHce || !row.physician_assigned,
    boldGetter: (row) => row.has_discharge,
    onClick: (row) => onOpenHce(row),
    cellSx: {
      padding: "0 12px",
    },
  },
  {
    key: "age",
    header: "Edad",
    type: "text",
    field: "age",
    width: 55,
    align: "center",
    boldGetter: (row) => row.has_discharge,
  },
  {
    key: "sex",
    header: "Sexo",
    type: "text",
    field: "sex",
    width: 55,
    align: "center",
    boldGetter: (row) => row.has_discharge,
  },
  {
    key: "doctor",
    header: "Médico",
    type: "text",
    field: "physician_name_display",
    width: 160,
    align: "left",
    boldGetter: (row) => row.has_discharge,
  },
  {
    key: "lab",
    header: "Lab",
    type: "clinical-status",
    field: "lab",
    clinicalIcon: "lab",
    width: 50,
    align: "center",
  },
  {
    key: "img",
    header: "Img",
    type: "clinical-status",
    field: "img",
    clinicalIcon: "img",
    width: 50,
    align: "center",
  },
  {
    key: "indication",
    header: "Indc. Med.",
    type: "clinical-status",
    field: "indication",
    clinicalIcon: "indication",
    width: 50,
    align: "center",
  },
  {
    key: "interconsult",
    header: "Interc.",
    type: "clinical-status",
    field: "interconsult",
    clinicalIcon: "interconsult",
    width: 50,
    align: "center",
    clickable: true,
    onClick: (row) => onOpenInfo(row),
  },
  {
    key: "attentionCode",
    header: "Atención",
    type: "attention-code",
    field: "attention_id",
    width: 90,
  },
  {
    key: "info",
    header: "Info",
    type: "info-button",
    width: 50,
    align: "center",
    clickable: true,
    disabledGetter: (row) => !canReadInfo || row.box.stage === "ESPERA",
    onClick: (row) => onOpenInfo(row),
  },
]

 

const Triage = lazy(() => import("triage/Triage"));

export default function MonitorPage() {
  const canReadTriage  = usePermiso(PERMISOS_EMERGENCY.triage.read)
  const canWriteTriage = usePermiso(PERMISOS_EMERGENCY.triage.write)
  const canReadBeds    = usePermiso(PERMISOS_EMERGENCY.beds)
  const canEditBox = true
  const canReadHce = true
  const canReadInfo = true
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<MonitorTableRow | null>(
    null,
  );
  const [triajeOpen, setTriajeOpen] = useState(false);
  const [triajeModo, setTriajeModo]  = useState<"read" | "write">("write");
  const [selectedTriageId, setSelectedTriageId] = useState<number | undefined>(undefined);
  const [medicoOpen, setMedicoOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [boxModalOpen, setBoxModalOpen] = useState(false)
  const [boxModalType, setBoxModalType] = useState<"change" | "assign">("assign")
  const [selectedBoxPatient, setSelectedBoxPatient] =
    useState<MonitorTableRow | null>(null)  
  const [disponibilidadOpen, setDisponibilidadOpen] = useState(false);
  const [attentionWarningOpen, setAttentionWarningOpen] = useState(false)

  const sede = useSede()
  const {
    beds:    bedBoardData,
    loading: bedBoardLoading,
  } = useBedBoard({ locationId: sede?.id, enabled: disponibilidadOpen })

  const bedBoard = useMemo(() => bedBoardData.map(mapBedApiItemToAvailabilityItem), [bedBoardData])

  const {
    data: monitorData,
    loading: monitorLoading,
    error: monitorError,
    refetch: refetchMonitor,
  } = useEmergencyMonitor({
    page: currentPage,
    limit: PAGE_SIZE,
  })


  const response = monitorData as MonitorApiResponse | null

  const rows = useMemo<MonitorTableRow[]>(() => {
    if (!response?.data?.items) return []

    return response.data.items
      .map(mapMonitorApiItemToTableRow)
      .sort(monitorSortComparator)
  }, [response])

  const summary = useMemo<MonitorSummary[]>(() => {
    if (!response?.data?.summary) return []

    return mapMonitorApiSummaryToSummary(response.data.summary)
  }, [response])




  
  const meta = response?.data?.meta
 


  const totalPages = meta?.totalPages ?? 1

  const handleOpenTriageWrite = useCallback(() => {
    setTriajeModo("write")
    setTriajeOpen(true)
  }, [])

  const handleOpenAsignarMedicos = useCallback(() => {
    // No requiere paciente preseleccionado: el modal muestra la lista de
    // pacientes disponibles (sin médico, o asignados a otro médico según
    // el modo Asignar/Reasignar) y el usuario elige de ahí.
    setMedicoOpen(true)
  }, [])

  const handleReportes = useCallback(() => {
    console.info("[MonitorPage] Reportes")
  }, [])

  const handleDisponibilidad = useCallback(() => {
    setDisponibilidadOpen(true)
  }, [])

  const handlePatientClick = useCallback((row: MonitorTableRow) => {
    console.info("[MonitorPage] Abrir HCE:", row)
  }, [])

  const handlePriorityClick = useCallback(
    (row: MonitorTableRow) => {
      if (!canReadTriage) {
        console.info("[MonitorPage] No tiene permiso para leer triaje:", row)
        return
      }
      if (row.triage_id == null) {
        console.info("[MonitorPage] La fila no tiene triaje vinculado todavía:", row)
        return
      }
      if (row.priority == null || row.priority== 'none') {
        console.info("[MonitorPage] El paciente no tiene prioridad todavía:", row)
        return
      }

      setSelectedTriageId(row.triage_id)
      setTriajeModo("read")
      setTriajeOpen(true)

      console.info("[MonitorPage] Abrir triaje solo lectura:", row)
    },
    [canReadTriage],
  )

  const handleBoxClick = useCallback((row: MonitorTableRow) => {
    const stage = row.box.stage

    if (stage === "ESPERA") {
      setAttentionWarningOpen(true)
      return
    }

    setSelectedBoxPatient(row)

    if (stage === "SALA_D") {
      setBoxModalType("assign")
      setBoxModalOpen(true)
      return
    }

    setBoxModalType("change")
    setBoxModalOpen(true)
  }, [])

  const handleInfo = useCallback((row: MonitorTableRow) => {

    setInfoOpen(true)
    setSelectedPatient(row)
  

  }, [])

  const handleSaveAdditionalInfo = useCallback(
    async (updatedPaciente: MonitorTableRow) => {
      console.info("Guardar cambios al cerrar modal:", updatedPaciente)
    },
    [],
  )


   const columns = useMemo(
    () =>
      createMonitorDskColumns({
        canReadTriage,
        canEditBox,
        canReadHce,
        canReadInfo,
        onOpenTriage: handlePriorityClick,
        onOpenHce: handlePatientClick,
        onOpenBox: handleBoxClick,
        onOpenInfo: handleInfo,
      }),
    [
      canReadTriage,
      canEditBox,
      canReadHce,
      canReadInfo,
      handlePriorityClick,
      handlePatientClick,
      handleBoxClick,
      handleInfo,
    ],
  )

  return (
    <>


  
      <Box
        sx={{
          inset: 0,
          height: "100% !important",
          display: "flex",
          flexDirection: "column",
          backgroundColor: hceClinicalColors.rowAlternate,
          overflow: "hidden",
          zIndex: 1,
          
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexwrap: "wrap",
            alignContent: 'space-between',
            height: "100%",
            flexDirection: "column",
            overflow: "hidden",
            padding: `${hceSpacing[3]} 52px ${hceSpacing[3]} ${hceSpacing[4]}`,
            gap: hceSpacing[3],
          }}
        >
          {/* Barra de acciones de monitoreo — ancho completo, iconos a la izquierda */}
          <Box sx={{ flexShrink: 0 }}>
            
            <MonitoActionBar
              tooltipPlacement="bottom"
              orientation="horizontal"
              onTriaje={canWriteTriage ? handleOpenTriageWrite : undefined}
              onAsignarMedicos={handleOpenAsignarMedicos}
              onReportes={handleReportes}
              onDisponibilidad={canReadBeds ? handleDisponibilidad : undefined}
            />
          </Box>

         <Box sx={{ flex: 1, overflow: "hidden", minHeight: 'fit-content' }}>
          {monitorLoading ? (
            <Box sx={{ p: 2 }}>Cargando monitor...</Box>
          ) : monitorError ? (
            <Box sx={{ p: 2 }}>Error: {monitorError}</Box>
          ) : (
            <Box sx={{ flex: 1, overflowX:"auto", height: "100%", marginBottom: '10px' }}>
            <GenericTable
              rows={rows}
              columns={columns}
              getRowId={(row) => row.id}
              maxHeight="45vh"
              rowAlertGetter={(row) => row.row_alert_color === "red"}
              
            />
            </Box>
          )}
          
        </Box>
            {/* <EmergencyPatientTable rows={paginatedRows} header={HEADER_COLUMNS} /> */}
          
          <Box
            sx={{
              flexShrink: 0,
              backgroundColor: hceClinicalColors.surfaceBg,
              borderRadius: hceBorderRadius.lg,
              boxShadow: hceShadows.card,
              border: `1px solid ${hceClinicalColors.border}`,
            }}
          >
            <EmergencyPagination
              summary={summary}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page)
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Panel de disponibilidad de camas — disparado por handleDisponibilidad (MonitoActionBar) */}
      <BedAvailabilityDrawerV2
        open={disponibilidadOpen}
        onClose={() => setDisponibilidadOpen(false)}
        beds={bedBoard}
        title={bedBoardLoading ? "Disponibilidad de camas (cargando...)" : "Disponibilidad de camas"}
      />

      {/* Modal de Triaje */}
      {/* <TriajeModal
        open={triajeOpen}
        onClose={() => setTriajeOpen(false)}
        onGuardar={(form) => {
          console.info("[MonitorPage] Triaje guardado:", form)
          // TODO: llamar a POST /api/triaje con los datos del form
        }}
      /> */}
      {triajeOpen && (
        <Suspense fallback={null}>
          <Triage
            open={triajeOpen}
            mode={triajeModo}
            triageId={selectedTriageId}
            onClose={() => setTriajeOpen(false)}
            onGuardar={(form:TriajeForm) => {
              // El POST ya ocurrió dentro de Triage.tsx (createTriage) antes de llamar
              // a este callback; acá solo queda refrescar la data del monitor para que
              // el triaje recién guardado se refleje sin esperar al próximo auto-refetch.
              console.info("[MonitorPage] Triaje guardado:", form);
              refetchMonitor();
            }}
          />
        </Suspense>
      )}

      {/* Modal de Asignar Médico — trae su propia lista de pacientes candidatos (endpoints dedicados) */}
      <AsignarMedicoModal
        open={medicoOpen}
        onClose={() => setMedicoOpen(false)}
        onAsignar={({ encounterId, username }) => {
          console.info("[MonitorPage] Asignación médico:", { encounterId, username });
          // TODO: llamar a POST /api/pacientes/medico con { encounter_id: encounterId, username }
          // y luego refetchMonitor() para reflejar el nuevo physician_name_display.
        }}
        />
      {/* Modal de Información Adicional */}
      <AditionalInfoModal
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        paciente={selectedPatient ?? undefined}
        onSaveChanges={handleSaveAdditionalInfo}
      />


   {/* Modal de Box */}
    <BoxModal
      open={boxModalOpen}
      onClose={() => setBoxModalOpen(false)}
      paciente={selectedBoxPatient ?? undefined}
      type={boxModalType}
      onSaved={async () => {
        refetchMonitor()
      }}
    />


   {/* Modal de Box - ESPERA */}
    <HceModal
  maxWidth={460}
  open={attentionWarningOpen}
  title="Paciente aún no cuenta con atención"
  description="Por favor comunicarse con el medico."
  icon= {<UiWarningIcon/>}
  confirmButton={{
    label: "Aceptar",
    onClick: () => setAttentionWarningOpen(false),
  }}
/>
    </>
  );
}
