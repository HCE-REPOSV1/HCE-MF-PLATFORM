
import type {  MonitorTableRow } from "../types/monitor.table.types"

import {
  HceFormModal,
  hceColors, hceTypography, Typography,
  
  Box,
  
 
} from "@hce/design-system"
import { FormControl, MenuItem, Select, type SelectChangeEvent } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";


interface BedOption {
  id: string
  label: string
}

const MOCK_BED_OPTIONS: BedOption[] = [
  { id: "BOX-01", label: "Box 01" },
  { id: "BOX-02", label: "Box 02" },
  { id: "BOX-03", label: "Box 03" },
  { id: "BOX-04", label: "Box 04" },
]

export interface BoxModalProps {
open: boolean
  onClose: () => void
  paciente?: MonitorTableRow
  title?: string
  type: "change" | "assign"
  onSaveChanges?: (
    paciente: MonitorTableRow,
    bedId: string,
  ) => void | Promise<void>
 
}





export function BoxModal({ open, onClose, paciente,onSaveChanges,title,type }: BoxModalProps) { 

 

    const [localPaciente, setLocalPaciente] = useState<MonitorTableRow | null>(
    paciente ?? null,
  )

  const [bedOptions, setBedOptions] = useState<BedOption[]>([])
  const [selectedBedId, setSelectedBedId] = useState("")
  const [loadingBeds, setLoadingBeds] = useState(false)
  const [saving, setSaving] = useState(false)



  useEffect(() => {
        if (!open) return

        setLocalPaciente(paciente ? { ...paciente } : null)
        setSelectedBedId("")
        setSaving(false)
    }, [open, paciente])

   useEffect(() => {
        if (!open) return

        setLoadingBeds(true)

        // TODO: reemplazar por llamada real al endpoint.
        // Ejemplo futuro:
        // bedService.listAvailableBeds().then(setBedOptions)
        setBedOptions(MOCK_BED_OPTIONS)

        setLoadingBeds(false)
    }, [open])

  const modalTitle = useMemo(() => {
        if (title) return title

        return type === "assign" ? "Asignación de box" : "Cambio de box"
    }, [title, type])

  const contentTitle = useMemo(() => {
        if (type === "assign") return null

        return "Cambio de camas entre servicio"
    }, [type])
  const patientName = localPaciente?.patient_name ?? "-"

  const handleSelectBed = (event: SelectChangeEvent<string>) => {
        setSelectedBedId(event.target.value)
    }

  const handleCancel = useCallback(() => {
    onClose()
  }, [onClose])

  const handleSave = useCallback(async () => {
    if (!localPaciente || !selectedBedId) return

    try {
      setSaving(true)
      await onSaveChanges?.(localPaciente, selectedBedId)
      onClose()
    } finally {
      setSaving(false)
    }
  }, [localPaciente, selectedBedId, onClose, onSaveChanges])

  
const isSaveDisabled = !selectedBedId || loadingBeds || saving || !localPaciente
  
    return(

    <HceFormModal
      open={open}
      onClose={handleCancel}
      title={modalTitle}
      maxWidth={420}
      buttonAlign="right"
      primaryButton= {{
                label: "Guardar",
                onClick: handleSave,
                color: hceColors.primary.green[600],
                disabled:
                  isSaveDisabled,
              }}
        secondaryButton= {{
          label:   "Cancelar",
          onClick: handleCancel,
          disabled: saving,
        }}
        >
        {/* El HceModal acepta children opcionales — aquí metemos el select */}
       <Box sx={{ textAlign: "left", mt: 1 }}>
        {!localPaciente ? (
          <Box
            sx={{
              py: 1.5,
              textAlign: "center",
              fontFamily: hceTypography.fontFamily,
              fontSize: "0.875rem",
              color: hceColors.neutro.black[300],
            }}
          >
            Cargando información del paciente
          </Box>
        ) : (
          <>
            {contentTitle && (
              <Typography
                sx={{
                  mb: 2,
                  textAlign: "center",
                  color: hceColors.primary.blue[600],
                  fontFamily: hceTypography.fontFamily,
                  fontSize: "1rem",
                  fontWeight: hceTypography.weight.medium,
                }}
              >
                {contentTitle}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: type === "assign" ? "center" : "flex-start",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}
            >
              <Typography
                component="span"
                sx={{
                  color: hceColors.primary.blue[600],
                  fontFamily: hceTypography.fontFamily,
                  fontSize: "0.875rem",
                  fontWeight: hceTypography.weight.medium,
                }}
              >
                Paciente:
              </Typography>

              <Typography
                component="span"
                sx={{
                  color: hceColors.primary.blue[600],
                  fontFamily: hceTypography.fontFamily,
                  fontSize: "0.875rem",
                  fontWeight: hceTypography.weight.bold,
                  textTransform: "uppercase",
                }}
              >
                {patientName}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  mb: "4px",
                  color: hceColors.primary.blue[600],
                  fontFamily: hceTypography.fontFamily,
                  fontSize: "0.75rem",
                  fontWeight: hceTypography.weight.bold,
                }}
              >
                Camas disponibles
              </Typography>

              <FormControl fullWidth size="small">
                <Select
                  value={selectedBedId}
                  onChange={handleSelectBed}
                  displayEmpty
                  disabled={loadingBeds}
                  sx={{
                    height: 36,
                    borderRadius: "7px",
                    color: hceColors.primary.blue[600],
                    fontFamily: hceTypography.fontFamily,
                    fontSize: "0.875rem",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: hceColors.primary.blue[600],
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: hceColors.primary.blue[600],
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: hceColors.primary.blue[600],
                      borderWidth: "1px",
                    },
                    "& .MuiSvgIcon-root": {
                      color: hceColors.primary.blue[600],
                    },
                  }}
                  renderValue={(value) => {
                    if (loadingBeds) return "Cargando camas..."
                    if (!value) return "-Seleccionar opción-"

                    return (
                      bedOptions.find((bed) => bed.id === value)?.label ??
                      value
                    )
                  }}
                >
                  <MenuItem value="" disabled>
                    -Seleccionar opción-
                  </MenuItem>

                  {bedOptions.map((bed) => (
                    <MenuItem key={bed.id} value={bed.id}>
                      {bed.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </>
        )}
      </Box>
    </HceFormModal>
    )

}
