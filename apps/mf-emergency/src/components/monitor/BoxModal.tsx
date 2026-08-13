import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Box,
  HceFormModal,
  hceColors,
  hceTypography,
  Typography,
  HceModal,
  UiCheckedIcon,
  SelectField,
} from "@hce/design-system"

import type { MonitorTableRow } from "../../types/monitor.table.types"
import { useSede } from "../../hooks/useSede"
import {
  getAvailableBeds,
  reassignBed,
  type BedOption,
} from "../../services/bedManagement.service"
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
        color: "var(--ds-color-interactive-button)",
        disabled: isSaveDisabled,
      }}
      secondaryButton={{
        label: "Cancelar",
        onClick: handleCancel,
        disabled: saving,
      }}
      buttonsFullWidth
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
                  color: "var(--ds-color-interactive)",
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
                  color: "var(--ds-color-interactive)",
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
                  color: "var(--ds-color-interactive)",
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
              <SelectField
                label="Camas disponibles"
                value={selectedBedId}
                onChange={setSelectedBedId}
                options={bedOptions.map((bed) => ({
                  value: bed.id,
                  label: bed.label,
                }))}
                placeholder={
                  loadingBeds
                    ? "-Cargando camas-"
                    : bedOptions.length === 0
                      ? "-No hay camas disponibles-"
                      : "-Seleccionar opción-"
                }
                disabled={loadingBeds || saving || !locationId || bedOptions.length === 0}
              />
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
