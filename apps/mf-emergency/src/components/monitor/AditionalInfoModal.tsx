
import type {  MonitorTableRow } from "../../types/monitor.table.types"

import type {  GenericTableColumn } from "@hce/design-system";
import {
  HceFormModal,
  hceColors, hceTypography,
   GenericTable,
  Box,
  UiCloseIcon,
 
} from "@hce/design-system"
import { useCallback, useEffect, useMemo, useState } from "react";


export interface AditionalInfoModalProps {
  open:       boolean
  onClose:    () => void
  /** Nombre del paciente al que se asigna el médico (opcional, para mostrar en el modal) */
  paciente?:  MonitorTableRow

  onSaveChanges?: (paciente: MonitorTableRow) => void | Promise<void>
 
}

 const createInfoColumns = ({ canReadVIP,onChangeVIP, onChangeDischarge }: {canReadVIP: boolean
  onChangeVIP: (row: MonitorTableRow, checked: boolean) => void
  onChangeDischarge: (row: MonitorTableRow) => void
}): GenericTableColumn<MonitorTableRow>[] => [
   {
     key: "waitingBoxTime",
    header: "Tiempo de espera - BOX",
    type: "waiting-time",
    field: "waiting_time_box_display",
    colorField: "waiting_time_box_color",
    width: 180,
    align: "center",
  },
  {
     key: "waitingPhysicianTime",
    header: "Tiempo de espera - Médico",
    type: "waiting-time",
    field: "waiting_time_physician_display",
    colorField: "waiting_time_physician_color",
    width: 180,
    align: "center",
  },
  {
    key: "attentionDate",
    header: "F. atención",
    type: "text",
    field: "attentionDate",
    width: 120,
    align: "center",
    boldGetter: (row) => row.has_discharge,
  },
  {
   key: "attentionHour",
    header: "H. atención",
    type: "text",
    field: "attentionHour",
    width: 80,
    align: "center",
    boldGetter: (row) => row.has_discharge,
  },
  {
    key: "dischargeDate",
    header: "Fecha de alta",
    type: "text",
    field: "dischargeDate",
    width: 120,
    align: "center",
    boldGetter: (row) => row.has_discharge,
  },
  {
   key: "dischargeHour",
    header: "Hora de alta",
    type: "text",
    field: "dischargeHour",
    width: 80,
    align: "center",
    boldGetter: (row) => row.has_discharge,
  },
  {
    key: "vip",
    header: "Paciente VIP",
    type: "switch",
    field: "is_vip",
    width: 180,
    align: "center",
    disabledGetter: () => !canReadVIP,
     onClick: (row, checked) => onChangeVIP(row, Boolean(checked)),
  },
   {
  key: "has_discharge",
  header: "Deshacer alta",
  type: "icon",
  field: "has_discharge",
  icon: UiCloseIcon,
  iconSize: 20,
  width: 80,
  align: "center",
  clickable: true,
  disabledGetter: (row) => !row.has_discharge,
  colorGetter: (row) => (row.has_discharge ? "#BD0000" : "#A0A0A0"),
  onClick: (row) => {
    onChangeDischarge(row)
  },
}

]




export function AditionalInfoModal({ open, onClose, paciente,onSaveChanges }: AditionalInfoModalProps) { 

    const canReadVIP = true

    const [localPaciente, setLocalPaciente] = useState<MonitorTableRow | null>(
    paciente ?? null,
  )

  const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
    if (!open) return

    setLocalPaciente(paciente ? { ...paciente } : null)
    setHasChanges(false)
  }, [open, paciente])

 const handleVIPClick = useCallback(
  (row: MonitorTableRow, checked: boolean) => {
    setLocalPaciente((prev) => {
      if (!prev || prev.id !== row.id) return prev

      setHasChanges(true)

      const updated = {
        ...prev,
        is_vip: checked,
      }

      console.info("Cambios en paciente VIP:", updated)

      return updated
    })
  },
  [],
)

  const handleClose = useCallback(async () => {
    if (hasChanges && localPaciente) {
      await onSaveChanges?.(localPaciente)
    }

    onClose()
  }, [hasChanges, localPaciente, onClose, onSaveChanges])

  const handleDischargeClick = useCallback((row: MonitorTableRow) => {
    setLocalPaciente((prev) => {
      if (!prev || prev.id !== row.id) return prev

      setHasChanges(true)

      
       const updated = {
        ...prev,
        has_discharge: !prev.has_discharge,
        dischargeDate: "-",
        dischargeHour: "-",
        
       
      }
      console.info("Cambios en paciente con alta:", updated)
      return updated
    })
  }, [])

  const columns = useMemo(
    () =>
      createInfoColumns({
        canReadVIP,
        onChangeVIP: handleVIPClick,
        onChangeDischarge: handleDischargeClick,
      }),
    [canReadVIP, handleVIPClick, handleDischargeClick],
  )
    return(

    <HceFormModal
        open={open}
        onClose={handleClose}
        title="Información adicional"
        maxWidth={1200}
        buttonAlign="right"
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
              Cargando informacion del paciente
            </Box>
          ) : (
            <GenericTable
              rows={[localPaciente]}
              columns={columns}
              getRowId={(row) => row.id}
              //maxHeight="45vh"
            />
          )}
        </Box>
        </HceFormModal>

)




}
