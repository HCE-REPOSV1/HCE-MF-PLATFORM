import {
  Box,
  EmergencyPagination,
  GenericTable,
  hceBorderRadius,
  hceClinicalColors,
  HceHeader,
  hceShadows,
  hceSpacing,
} from "@hce/design-system"

import type {
  GenericTableColumn,
 
} from "@hce/design-system"

import { useEffect, useMemo, useState } from "react";
import type { MonitorSummary, MonitorTableRow } from "../types/monitor.table.types";
import { useEmergencyMonitor } from "../hooks/useEmergencyMonitor";
import type { MonitorApiResponse } from "../types/monitor.api.types";
import { mapMonitorApiItemToTableRow, mapMonitorApiSummaryToSummary } from "../mapper/monitor.mapper";
import { useParams } from "react-router-dom";
import { monitorSortComparator } from "../utils/monitorSort"


const PAGE_SIZE = 10

const AUTO_PAGE_INTERVAL_MS = 5000

const toTvPatientName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/)

  if (parts.length === 0) return "-"

  const firstName = parts[0]
  const firstLastNameInitial = parts[1]?.[0]

  if (!firstLastNameInitial) return firstName

  return `${firstName} ${firstLastNameInitial}.`
}



const MONITOR_TV_COLUMNS  : GenericTableColumn<MonitorTableRow>[] = [
   {
    key: "priority",
    header: "Prioridad",
    type: "priority",
    field: "priority",
    width: 100,
    align: "center",
    clickable: false,
    
  },
  {
    key: "box",
    header: "Box",
    type: "box",
    field: "box",
    width: 120,
    align: "center",
    clickable: false,
   
  },
  {
    key: "patient",
    header: "Paciente",
    type: "patient-name",
    width: 140,
    align: "left",
    clickable: false,
    valueGetter: (row) => {
      const name = row.is_vip ? row.patient_name_masked : row.patient_name

      return row.is_vip ? name : toTvPatientName(name)
    },
    boldGetter: (row) => row.has_discharge,
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
  },
  {
    key: "doctor",
    header: "Médico",
    type: "text",
    field: "physician_name_display",
    width: 190,
    align: "left",
    boldGetter: (row) => row.has_discharge,
  },
  {
    key: "lab",
    header: "Lab",
    type: "clinical-status",
    field: "lab",
    clinicalIcon: "lab",
    width: 60,
    align: "center",
  },
  {
    key: "img",
    header: "Img",
    type: "clinical-status",
    field: "img",
    clinicalIcon: "img",
    width: 60,
    align: "center",
  },
  {
    key: "indication",
    header: "Indc. Med.",
    type: "clinical-status",
    field: "indication",
    clinicalIcon: "indication",
    width: 60,
    align: "center",
  },
  {
    key: "interconsult",
    header: "Interc.",
    type: "clinical-status",
    field: "interconsult",
    clinicalIcon: "interconsult",
    width: 60,
    align: "center",
  },
  {
    key: "attentionDate",
    header: "F. atención",
    type: "text",
    field: "attentionDate",
    width: 120,
    align: "center",
    boldGetter: (row) => row.has_discharge,
  },
  {
   key: "attentionHour",
    header: "H. atención",
    type: "text",
    field: "attentionHour",
    width: 80,
    align: "center",
    boldGetter: (row) => row.has_discharge,
  },
  {
     key: "waitingBoxTime",
    header: "T. espera - BOX",
    type: "waiting-time",
    field: "waiting_time_box_display",
    colorField: "waiting_time_box_color",
    width: 155,
    align: "center",
  },
]



export default function EmergencyTvPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const { locationUuid } = useParams<{ locationUuid: string }>()
  
  const {
    data: monitorData,
    loading: monitorLoading,
    error: monitorError,
    refetch,
  } = useEmergencyMonitor({
    page: currentPage,
    limit: PAGE_SIZE,
    locationUuid,
  })

  const response = monitorData as MonitorApiResponse | null
  const sedeName = response?.data?.location_name ?? "-"

  // Determinar si es la carga inicial real (no tenemos datos aún y está cargando)
  const isFirstLoading = monitorLoading && !response;

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

  // Intervalo para paginado automático
  useEffect(() => {
    // IMPORTANTE: Quitamos "monitorLoading" de aquí para que el contador 
    // no se pause o rompa mientras se hace el fetch en segundo plano.
    if (monitorError) return
    if (totalPages <= 0) return

    const intervalId = window.setInterval(() => {
      if (totalPages === 1) {
        refetch()
        return
      }

      setCurrentPage((prevPage) => {
        if (prevPage >= totalPages) {
          return 1
        }
        return prevPage + 1
      })
    }, AUTO_PAGE_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [totalPages, monitorError, refetch])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  return (
    <Box
      sx={{
        inset: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: hceClinicalColors.rowAlternate,
        overflow: "hidden",
        zIndex: 1,
        height: "100% !important",
      }}
    >
      <Box sx={{
          flex: 1,
          display: "flex",
          flexWrap: "wrap",
          alignContent: 'space-between',
          height: "100%",
          flexDirection: "column",
          overflow: "hidden",
          padding: `0`,
          gap: hceSpacing[3],
        }}>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            padding: `0`,
            gap: hceSpacing[3],
          }}
        >
          <HceHeader title="Monitor TV " variant="tv" sede={sedeName} testId="mf-emergency-tv-header" />

          <Box sx={{ flex: 1, overflow: "hidden", minHeight: 0 , padding: "0 8px 0 8px"}}>
            {/* 1. Cambiado monitorLoading por isFirstLoading */}
            {isFirstLoading ? (
              <Box sx={{ p: 2 }}>Cargando monitor TV...</Box>
            ) : monitorError ? (
              <Box sx={{ p: 2 }}>Error: {monitorError}</Box>
            ) : (
              <GenericTable
                rows={rows}
                columns={MONITOR_TV_COLUMNS}
                getRowId={(row) => row.id}
                getRowTestId={(row) => `mf-emergency-tv-row-${row.id}`}
                maxHeight="100%"
                rowAlertGetter={(row) => row.row_alert_color === "red"}
                // Opcional: si GenericTable soporta una opacidad o un loading interno, 
                // puedes pasárselo sin desmontar el componente completo.
                // loading={monitorLoading} 
              />
            )}
          </Box>
        </Box>
      </Box>
      
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
          onPageChange={() => undefined}
          testId="mf-emergency-tv-pagination"
        />
      </Box>
    </Box>
  )
}