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
import {
  getPacientesSinMedicoMock,
  getPacientesConMedicoMock,
  type PacienteSinMedico,
  type PacienteConMedico,
} from "../mock/pacientesAsignacion.mock"

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AsignarMedicoModalProps {
  open:      boolean
  onClose:   () => void
  /** Callback al confirmar. encounterId = paciente elegido, username = médico logueado que registra. */
  onAsignar: (payload: { encounterId: number; username: string }) => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

const OPTIONS = [
  { value: true,  label: "Asignar" },
  { value: false, label: "Reasignar" },
]

export function AsignarMedicoModal({ open, onClose, onAsignar }: AsignarMedicoModalProps) {
  const { user } = useUser()
  const [encounterId, setEncounterId] = useState("")
  // true = Asignar (GET /api/pacientes/sin-medico), false = Reasignar (GET /api/pacientes/con-medico)
  const [modo, setModo] = useState<boolean | string>(true)
  const [pacientesSinMedico, setPacientesSinMedico] = useState<PacienteSinMedico[]>([])
  const [pacientesConMedico, setPacientesConMedico] = useState<PacienteConMedico[]>([])
  const [cargando, setCargando] = useState(false)

  // Cada apertura arranca siempre en modo "Asignar".
  useEffect(() => {
    if (open) setModo(true)
  }, [open])

  // Carga la lista correspondiente al modo activo.
  // TODO: reemplazar getPacientesSinMedicoMock()/getPacientesConMedicoMock() por
  // GET /api/pacientes/sin-medico y GET /api/pacientes/con-medico respectivamente.
  useEffect(() => {
    if (!open) return
    setEncounterId("")
    setCargando(true)
    const timer = setTimeout(() => {
      if (modo === true) {
        setPacientesSinMedico(getPacientesSinMedicoMock())
      } else {
        setPacientesConMedico(getPacientesConMedicoMock())
      }
      setCargando(false)
    }, 300) // simula latencia de API
    return () => clearTimeout(timer)
  }, [open, modo])

  const pacientesDisponibles = modo === true ? pacientesSinMedico : pacientesConMedico

  const selectOptions = pacientesDisponibles.map((p) => ({
    value: String(p.encounter_id),
    label: p.complete_name,
  }))

  // Solo tiene sentido en modo Reasignar: muestra quién es el médico ya asignado
  // al paciente elegido.
  const pacienteConMedicoSeleccionado =
    modo === false
      ? pacientesConMedico.find((p) => String(p.encounter_id) === encounterId)
      : undefined

  function handleConfirmar() {
    if (!encounterId || !user?.username) return
    onAsignar({ encounterId: Number(encounterId), username: user.username })
    onClose()
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
        label: "Asignar",
        onClick: handleConfirmar,
        color: hceColors.primary.green[600],
        disabled: !encounterId || cargando,
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
            onChange={(v) => setModo(v)}
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

          {pacienteConMedicoSeleccionado && (
            <Typography
              sx={{
                fontFamily: hceTypography.fontFamily,
                fontSize:   "0.8rem",
                color:      hceColors.neutro.black[400],
              }}
            >
              Médico actual asignado: <strong>{pacienteConMedicoSeleccionado.physician_name}</strong>
            </Typography>
          )}
        </div>
      </Box>
    </HceFormModal>
  )
}
