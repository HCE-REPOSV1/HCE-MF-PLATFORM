import { useEffect, useMemo, useState } from "react"
import { Box } from "@mui/material"
import {
  HceFormModal,
  SelectField,
  hceColors,
  hceTypography,
  RadioGroup,
} from "@hce/design-system"
import { useUser } from "shell/UserContext"
import { useSedeUuid } from "../hooks/useSedeUuid"
import {
  getAssignmentCandidates,
  getReassignmentCandidates,
  assignPractitioner,
  type AssignmentCandidate,
} from "../services/practitionerAssignment.service"

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AsignarMedicoModalProps {
  open:      boolean
  onClose:   () => void
  /** Callback al confirmar (ya asignado/reasignado en backend) — usar para refetchear el monitor. */
  onAsignar: (payload: { encounterId: number; username: string }) => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

const OPTIONS = [
  { value: true,  label: "Asignar" },
  { value: false, label: "Reasignar" },
]

export function AsignarMedicoModal({ open, onClose, onAsignar }: AsignarMedicoModalProps) {
  const { user } = useUser()
  const sedeUuid = useSedeUuid()
  const [encounterId, setEncounterId] = useState("")
  // true = Asignar (GET assignment-candidates), false = Reasignar (GET reassignment-candidates)
  const [modo, setModo] = useState<boolean | string>(true)
  const [candidatos, setCandidatos] = useState<AssignmentCandidate[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const [tipoAsignacion, setTipoAsignacion] = useState<boolean | string>(true)

  // Carga la lista correspondiente al modo activo.
  useEffect(() => {
    if (!open || !sedeUuid) return
    let cancelled = false
    setEncounterId("")
    setCargando(true)
    setError(null)

    const fetchCandidatos = modo === true ? getAssignmentCandidates : getReassignmentCandidates
    fetchCandidatos(sedeUuid)
      .then((items) => {
        if (!cancelled) setCandidatos(items)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setCargando(false)
      })

    return () => { cancelled = true }
  }, [open, modo, sedeUuid])

  const selectOptions = candidatos.map((p) => ({
    value: String(p.encounter_id),
    label: p.patient_name,
  }))

  // Solo tiene sentido en modo Reasignar: muestra quién es el médico ya asignado
  // al paciente elegido.
  const candidatoSeleccionado =
    modo === false
      ? candidatos.find((p) => String(p.encounter_id) === encounterId)
      : undefined

  async function handleConfirmar() {
    if (!encounterId || !user?.username) return
    setEnviando(true)
    setError(null)
    try {
      await assignPractitioner(Number(encounterId), {
        ad_username: user.username,
        user_modify: user.username,
      })
      onAsignar({ encounterId: Number(encounterId), username: user.username })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <HceFormModal
      open={open}
      onClose={onClose}
      title="Asignar o reasignar médico a paciente"
      borderNone
      iconClose={false}
      maxWidth={400}
      primaryButton={{
        label: "Cancelar",
        onClick: onClose,
      }}
      secondaryButton={{
        label: tipoAsignacion ? "Asignar" : "Reasignar",
        onClick: handleConfirmar,
        color: hceColors.primary.green[600],
        disabled: !encounterId || cargando || enviando,
      }}
      secondaryButton={{
        label: "Cancelar",
        onClick: onClose,
        color: hceColors.primary.blue[600],
      }}
      buttonAlign="center"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          mx: "20px",
          mt: 1,
          textAlign: "left",
        }}
      >
        <RadioGroup
          legend="Grupo de Radio"
          options={RADIO_OPTIONS}
          value={tipoAsignacion}
          onChange={setTipoAsignacion}
          disabled={false}
        />

          {cargando ? (
            <Box sx={{ py: 1.5, textAlign: "center", fontFamily: hceTypography.fontFamily, fontSize: "0.875rem", color: hceColors.neutro.black[300] }}>
              Cargando pacientes disponibles…
            </Box>
          ) : (
            <SelectField
              label="Lista de pacientes"
              value={encounterId}
              onChange={setEncounterId}
              options={selectOptions}
              placeholder={
                selectOptions.length === 0
                  ? "-No hay pacientes disponibles-"
                  : "-Seleccionar paciente-"
              }
              disabled={selectOptions.length === 0}
            />
          )}

          {candidatoSeleccionado && (
            <Typography
              sx={{
                fontFamily: hceTypography.fontFamily,
                fontSize:   "0.8rem",
                color:      hceColors.neutro.black[400],
              }}
            >
              Médico actual asignado: <strong>{candidatoSeleccionado.practitioner_name}</strong>
            </Typography>
          )}

          {error && (
            <Typography
              sx={{
                fontFamily: hceTypography.fontFamily,
                fontSize:   "0.8rem",
                color:      hceColors.alert.error[600],
              }}
            >
              {error}
            </Typography>
          )}
        </div>
      </Box>
    </HceFormModal>
  )
}