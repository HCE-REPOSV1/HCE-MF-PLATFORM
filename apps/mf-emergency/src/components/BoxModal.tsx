import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Box,
  HceFormModal,
  hceColors,
  hceTypography,
  Typography,
  HceModal,
  UiCheckedIcon,
} from "@hce/design-system"
import {
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material"

import type { MonitorTableRow } from "../types/monitor.table.types"
import { useSede } from "../hooks/useSede"
import {
  getAvailableBeds,
  reassignBed,
  type BedOption,
} from "../services/bedManagement.service"
import { useUser } from "shell/UserContext"

export interface BoxModalProps {
  open: boolean
  onClose: () => void
  paciente?: MonitorTableRow
  title?: string
  type: "change" | "assign"

  onSaved?: () => void | Promise<void>
}

export function BoxModal({
  open,
  onClose,
  paciente,
  title,
  type,
 
  onSaved,
}: BoxModalProps) {
  const [localPaciente, setLocalPaciente] = useState<MonitorTableRow | null>(
    paciente ?? null,
  )

  const [bedOptions, setBedOptions] = useState<BedOption[]>([])
  const [selectedBedId, setSelectedBedId] = useState("")
  const [loadingBeds, setLoadingBeds] = useState(false)
  const [saving, setSaving] = useState(false)
    const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sede = useSede()

  const user: string = useUser().user?.username ?? ""
  const locationId = sede?.id

  useEffect(() => {
    if (!open) return

    setLocalPaciente(paciente ? { ...paciente } : null)
    setSelectedBedId("")
    setBedOptions([])
    setSaving(false)
    setLoadingBeds(false)
    setError(null)
  }, [open, paciente])

  useEffect(() => {
    if (!open) return

    if (!locationId) {
      setBedOptions([])
      setLoadingBeds(false)
      setError("No se encontró la sede para cargar camas disponibles")
      return
    }

    let cancelled = false

    const loadBeds = async () => {
      try {
        setLoadingBeds(true)
        setError(null)

        const beds = await getAvailableBeds(locationId)

        if (!cancelled) {
          setBedOptions(beds)
        }
      } catch (err) {
        if (!cancelled) {
          setBedOptions([])
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las camas disponibles",
          )
        }
      } finally {
        if (!cancelled) {
          setLoadingBeds(false)
        }
      }
    }

    void loadBeds()

    return () => {
      cancelled = true
    }
  }, [open, locationId])

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
    if (saving) return

    onClose()
  }, [onClose, saving])

  const handleSave = useCallback(async () => {
  if (!localPaciente || !selectedBedId) return

  try {
    setSaving(true)
    setError(null)

    await reassignBed({
      encounter_id: Number(localPaciente.encounter_id),
      bed_id: Number(selectedBedId),
      assigned_by: user,
      user_create: user,
    })

    setConfirm(true)
  } catch (err) {
    setSaving(false)
    setError(
      err instanceof Error
        ? err.message
        : "No se pudo asignar la cama",
    )
  }
}, [localPaciente, selectedBedId, user])

const handleConfirm = useCallback(async () => {
  try {
    setConfirm(false)
    onClose()
    await onSaved?.()
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "No se pudo refrescar la información",
    )
  } finally {
    setSaving(false)
  }
}, [onSaved, onClose])

  const isSaveDisabled =
    !selectedBedId ||
    loadingBeds ||
    saving ||
    !localPaciente ||
    Boolean(error)

  return (
 <>
    <HceModal
      maxWidth={400}
      open={confirm}
      title="Cambio guardado con éxito"
      icon={<UiCheckedIcon />}
      confirmButton={{
        label: "Aceptar",
        onClick: handleConfirm,
      }}
    />
    
  {!confirm && (
      <HceFormModal
      open={open}
      onClose={handleCancel}
      title={modalTitle}
      maxWidth={420}
      buttonAlign="right"
      primaryButton={{
        label: saving ? "Guardando..." : "Guardar",
        onClick: handleSave,
        color: hceColors.primary.green[600],
        disabled: isSaveDisabled,
      }}
      secondaryButton={{
        label: "Cancelar",
        onClick: handleCancel,
        disabled: saving,
      }}
    >
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

            <Box sx={{ mb: error ? 1.5 : 3 }}>
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
                  disabled={loadingBeds || saving || !locationId}
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

                  {bedOptions.length === 0 && !loadingBeds ? (
                    <MenuItem value="" disabled>
                      No hay camas disponibles
                    </MenuItem>
                  ) : (
                    bedOptions.map((bed) => (
                      <MenuItem key={bed.id} value={bed.id}>
                        {bed.label}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Box>
          

            {error && (
              <Typography
                sx={{
                  mb: 2,
                  color: hceColors.alert.error[600],
                  fontFamily: hceTypography.fontFamily,
                  fontSize: "0.75rem",
                  fontWeight: hceTypography.weight.medium,
                }}
              >
                {error}
              </Typography>
            )}
            </>
          )}
        </Box>
      </HceFormModal>
    )}
  </>)}