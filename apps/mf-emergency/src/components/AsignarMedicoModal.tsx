import { useState, useEffect } from "react"
import { Box, Typography }     from "@mui/material"
import {
  HceModal,
  SelectField,
  hceColors, hceTypography,
  UiDoctorIcon, CloseIcon,
} from "@hce/design-system"
import { getMedicosMock } from "../mock/medicos.mock"
import type { Medico }    from "../mock/medicos.mock"

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AsignarMedicoModalProps {
  open:       boolean
  onClose:    () => void
  /** Nombre del paciente al que se asigna el médico (opcional, para mostrar en el modal) */
  paciente?:  string
  /** Callback al confirmar con el médico seleccionado */
  onAsignar:  (medico: Medico) => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function AsignarMedicoModal({ open, onClose, paciente, onAsignar }: AsignarMedicoModalProps) {
  const [medicoId,   setMedicoId]   = useState("")
  const [medicos,    setMedicos]    = useState<Medico[]>([])
  const [cargando,   setCargando]   = useState(false)

  // Carga la lista al abrir el modal
  // TODO: reemplazar getMedicosMock() por fetch al endpoint real
  useEffect(() => {
    if (!open) return
    setCargando(true)
    setMedicoId("")
    const timer = setTimeout(() => {
      setMedicos(getMedicosMock())
      setCargando(false)
    }, 500) // simula latencia de API
    return () => clearTimeout(timer)
  }, [open])

  const medicoSeleccionado = medicos.find(m => m.id === medicoId) ?? null

  function handleConfirmar() {
    if (!medicoSeleccionado) return
    onAsignar(medicoSeleccionado)
    onClose()
  }

  const selectOptions = medicos.map(m => ({
    value: m.id,
    label: `${m.nombre} — ${m.especialidad} (${m.turno})`,
  }))

  return (
    <HceModal
      open={open}
      onClose={onClose}
      title="Asignar médico"
      icon={<UiDoctorIcon size={28} color="#ffffff" />}
      iconBgColor={hceColors.primary.blue[600]}
      description={
        paciente
          ? `Selecciona el médico que atenderá a ${paciente}.`
          : "Selecciona el médico responsable de la atención."
      }
      maxWidth={460}
      confirmButton={{
        label:    "Asignar",
        onClick:  handleConfirmar,
        disabled: !medicoSeleccionado || cargando,
        color:    hceColors.primary.green[600],
        icon:     <UiDoctorIcon size={15} color="#ffffff" />,
      }}
      cancelButton={{
        label:   "Cancelar",
        onClick: onClose,
        color:   hceColors.primary.blue[500],
        icon:    <CloseIcon size={15} color={hceColors.primary.blue[500]} />,
      }}
      buttonLayout="row"
    >
      {/* El HceModal acepta children opcionales — aquí metemos el select */}
      <Box sx={{ textAlign: "left", mt: 1 }}>
        {cargando ? (
          <Box sx={{ py: 1.5, textAlign: "center", fontFamily: hceTypography.fontFamily, fontSize: "0.875rem", color: hceColors.neutro.black[300] }}>
            Cargando médicos disponibles…
          </Box>
        ) : (
          <SelectField
            label="Médico disponible"
            value={medicoId}
            onChange={setMedicoId}
            options={selectOptions}
            placeholder="-Seleccionar médico-"
          />
        )}

        {/* Detalle del médico seleccionado */}
        {medicoSeleccionado && (
          <Box sx={{
            mt:              1.5,
            px:              1.5,
            py:              1,
            backgroundColor: hceColors.primary.blue[50],
            borderRadius:    "8px",
            border:          `1px solid ${hceColors.primary.blue[100]}`,
          }}>
            <Typography sx={{ fontFamily: hceTypography.fontFamily, fontWeight: 700, fontSize: "0.82rem", color: hceColors.primary.blue[600] }}>
              {medicoSeleccionado.nombre}
            </Typography>
            <Typography sx={{ fontFamily: hceTypography.fontFamily, fontSize: "0.75rem", color: hceColors.neutro.black[400], mt: "2px" }}>
              {medicoSeleccionado.especialidad} · Turno {medicoSeleccionado.turno}
            </Typography>
          </Box>
        )}
      </Box>
    </HceModal>
  )
}
