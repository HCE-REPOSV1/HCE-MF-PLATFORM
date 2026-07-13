import { useEffect, useMemo, useState } from "react"
import { Box } from "@mui/material"
import {
  HceFormModal,
  SelectField,
  hceColors,
  hceTypography,
  RadioGroup,
} from "@hce/design-system"

import { getMedicosMock } from "../mock/medicos.mock"
import type { Medico } from "../mock/medicos.mock"

export interface AsignarMedicoModalProps {
  open: boolean
  onClose: () => void
  paciente?: string
  onAsignar: (medico: Medico) => void
}

const RADIO_OPTIONS = [
  { value: true, label: "Asignar" },
  { value: false, label: "Reasignar" },
]

export function AsignarMedicoModal({
  open,
  onClose,
  onAsignar,
}: AsignarMedicoModalProps) {
  const [medicoId, setMedicoId] = useState("")
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [cargando, setCargando] = useState(false)

  const [tipoAsignacion, setTipoAsignacion] = useState<boolean | string>(true)

  useEffect(() => {
    if (!open) return

    let mounted = true

    async function cargarMedicos() {
      setCargando(true)
      setMedicoId("")

      try {
        // TODO: reemplazar por el endpoint real
        await new Promise(resolve => setTimeout(resolve, 500))

        if (mounted) {
          setMedicos(getMedicosMock())
        }
      } finally {
        if (mounted) {
          setCargando(false)
        }
      }
    }

    cargarMedicos()

    return () => {
      mounted = false
    }
  }, [open])

  const selectOptions = useMemo(
    () =>
      medicos.map(medico => ({
        value: medico.id,
        label: medico.nombre,
      })),
    [medicos],
  )

  const medicoSeleccionado =
    medicos.find(medico => medico.id === medicoId) ?? null

  function handleConfirmar() {
    if (!medicoSeleccionado) return

    onAsignar(medicoSeleccionado)
    onClose()
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
        disabled: !medicoSeleccionado || cargando,
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
          <Box
            sx={{
              minHeight: "72px",
              py: 1.5,
              textAlign: "center",
              fontFamily: hceTypography.fontFamily,
              fontSize: "0.875rem",
              color: hceColors.neutro.black[300],
            }}
          >
            Cargando médicos disponibles…
          </Box>
        ) : (
          <SelectField
            label="Lista de médicos"
            value={medicoId}
            onChange={setMedicoId}
            options={selectOptions}
            placeholder="- Seleccionar médico -"
          />
        )}
      </Box>
    </HceFormModal>
  )
}