import { useEffect, useState } from "react"
import { Box, Typography } from "@mui/material"
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
  const [modo, setModo] = useState(true)

  const [candidatosAsignar, setCandidatosAsignar] = useState<
    AssignmentCandidate[]
  >([])

  const [candidatosReasignar, setCandidatosReasignar] = useState<
    AssignmentCandidate[]
  >([])

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (open) {
      setModo(true)
      setEncounterId("")
    }
  }, [open])

    // Carga la lista correspondiente al modo activo.
  useEffect(() => {
    if (!open || !sedeUuid) return

     const currentSedeUuid = sedeUuid
    let cancelled = false


    async function cargarCandidatos() {
      setCargando(true)
      setError(null)
      setEncounterId("")

      try {
         const [asignacion, reasignacion] = await Promise.all([
        getAssignmentCandidates(currentSedeUuid),
        getReassignmentCandidates(currentSedeUuid),
       ])

        if (cancelled) return

        setCandidatosAsignar(asignacion)
        setCandidatosReasignar(reasignacion)
      } catch (err: unknown) {
        if (cancelled) return

        setCandidatosAsignar([])
        setCandidatosReasignar([])
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelled) {
          setCargando(false)
        }
      }
    }

    cargarCandidatos()

    return () => {
      cancelled = true
    }
  }, [open, sedeUuid])

   const handleModoChange = (value: boolean | string) => {
    const nuevoModo = value === true || value === "true"

    if (nuevoModo === modo) return

    setEncounterId("")
    setError(null)
    setModo(nuevoModo)
  }

  const candidatos = modo
    ? candidatosAsignar
    : candidatosReasignar

  const selectOptions = candidatos.map((paciente) => ({
    value: String(paciente.encounter_id),
    label: paciente.patient_name,
  }))

  const candidatoSeleccionado = !modo
    ? candidatosReasignar.find(
        (paciente) => String(paciente.encounter_id) === encounterId,
      )
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
      borderNone={true}
      iconClose={false}
      maxWidth={400}
      primaryButton={{
        label: enviando
          ? modo
            ? "Asignando..."
            : "Reasignando..."
          : modo
            ? "Asignar"
            : "Reasignar",
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
      {/* El HceModal acepta children opcionales — aquí metemos el select */}
      <Box sx={{ textAlign: "left", mt: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '0 20px' }}>
         <RadioGroup
            legend="Tipo de asignación"
            options={OPTIONS}
            value={modo}
            onChange={handleModoChange}
            disabled={cargando || enviando}
          />

         <SelectField
            label="Lista de pacientes"
            value={encounterId}
            onChange={setEncounterId}
            options={selectOptions}
            placeholder={
               cargando
                ? "-Cargando pacientes-"
                : selectOptions.length === 0
                  ? "-No hay pacientes disponibles-"
                  : "-Seleccionar paciente-"
            }
            disabled={cargando || selectOptions.length === 0}
            menuMaxHeight = {280}
            />

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