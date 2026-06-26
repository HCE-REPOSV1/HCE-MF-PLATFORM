import {
  Box,
  EmergencyPagination,
  GenericTable,
  hceBorderRadius,
  hceClinicalColors,
  hceShadows,
  hceSpacing,
} from "@hce/design-system"

import type {
  GenericTableColumn,
  PatientRowData,
} from "@hce/design-system"

import { MOCK_PATIENTS, PAGE_SIZE } from "../mock/patients.mock"
import { useState } from "react";

const MONITOR_TV_COLUMNS: GenericTableColumn<PatientRowData>[] = [
  {
    key: "priority",
    header: "Prioridad",
    type: "priority",
    field: "priority",
    width: 70,
    align: "center",
  },
  {
    key: "box",
    header: "Box",
    type: "box",
    field: "box",
    width: 80,
    align: "center",
  },
  {
    key: "patient",
    header: "Paciente",
    type: "patient-name",
    field: "patient.name",
    width: 160,
    align: "left",
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
    type: "doctor",
    field: "doctor",
    width: 160,
    align: "left",
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
  },
  {
    key: "attentionDate",
    header: "F. atención",
    type: "text",
    field: "additionalInfo.attentionDate",
    width: 90,
    align: "center",
  },
  {
    key: "attentionHour",
    header: "H. atención",
    type: "text",
    field: "additionalInfo.attentionHour",
    width: 90,
    align: "center",
  },
  {
    key: "waitingBoxTime",
    header: "T. espera - BOX",
    type: "waiting-time",
    field: "additionalInfo.waitingBoxTime",
    width: 150,
    align: "center",
  },
]


  
function toTvPatientName(fullName: string) {
  const parts = fullName.trim().split(/\s+/)

  if (parts.length === 0) return "-"

  const firstName = parts[0]
  const firstLastNameInitial = parts[1]?.[0]

  if (!firstLastNameInitial) return firstName

  return `${firstName} ${firstLastNameInitial}.`
}

export default function EmergencyTvPage() {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(MOCK_PATIENTS.length / PAGE_SIZE)

  const paginatedRows: PatientRowData[] = MOCK_PATIENTS.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  ).map((row) => ({
    ...row,
    patient: {
      ...row.patient,
      name: row.isVip
        ? row.patient.name
        : toTvPatientName(row.patient.name),
    },
  }))

  return (
    <Box
      sx={{
        inset: 0,
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
          flexDirection: "column",
          overflow: "hidden",
          padding: `${hceSpacing[3]} 52px ${hceSpacing[3]} ${hceSpacing[4]}`,
          gap: hceSpacing[3],
        }}
      >
        <GenericTable
          rows={paginatedRows}
          columns={MONITOR_TV_COLUMNS}
          getRowId={(row) => row.id}
        />
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
          totalItems={MOCK_PATIENTS.length}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page)
          }}
        />
      </Box>
    </Box>
  )
}