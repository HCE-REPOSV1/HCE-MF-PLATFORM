import { useState, useEffect } from "react"
import { Box }     from "@mui/material"
import {
  HceFormModal,
  SelectField,
  hceColors, hceTypography,
  RadioGroup,
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

export function AsignarMedicoModal({ open, onClose, onAsignar }: AsignarMedicoModalProps) {
  const [medicoId,   setMedicoId]   = useState("")
  const [medicos,    setMedicos]    = useState<Medico[]>([])
  const [cargando,   setCargando]   = useState(false)
   const [value, setValue] = useState<boolean | string>(false);
  const OPTIONS = [
  { value: true, label: "Asignar" },
  { value: false, label: "Reasignar" },
];

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
    label: `${m.nombre}`,
  }))

  return (
    <HceFormModal
      open={open}
      onClose={onClose}
      title="Asignar o reasignar médico a paciente"
      borderNone={true}
      iconClose={false}
       maxWidth={400}
       primaryButton={{
        label: "Cancelar",
        onClick: onClose,
        
      }}
      secondaryButton={{
        

        label: "Asignar",
        onClick: handleConfirmar,
        color: hceColors.primary.green[600],
        disabled:!medicoSeleccionado || cargando,
        
      }}
      buttonAlign="center"

    >
      {/* El HceModal acepta children opcionales — aquí metemos el select */}
      <Box sx={{ textAlign: "left", mt: 1}}>
        {cargando ? (
          <Box sx={{ py: 1.5, textAlign: "center", fontFamily: hceTypography.fontFamily, fontSize: "0.875rem", color: hceColors.neutro.black[300] }}>
            Cargando pacientes disponibles…
          </Box>
        ) : (
        <div style={{display:'flex', flexDirection:'column', gap: '10px', margin:'0 20px'}}>
          <RadioGroup  
            legend= "Grupo de Radio"
            options={OPTIONS} 
            value={value}
            onChange={(v) => {
              setValue(v);
            }}
           disabled={false}

      />





          <SelectField
            label="Lista de pacientes"
            value={medicoId}
            onChange={setMedicoId}
            options={selectOptions}
            placeholder="-Seleccionar paciente-"
          />
          </div>
        )}

        {/* Detalle del médico seleccionado */}
        {/* {medicoSeleccionado && (
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
        )} */}
      </Box>
    </HceFormModal>
  )
}
