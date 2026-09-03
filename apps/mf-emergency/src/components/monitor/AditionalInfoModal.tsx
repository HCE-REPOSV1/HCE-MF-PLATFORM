import type { MonitorTableRow } from "../../types/monitor.table.types";

import type { GenericTableColumn } from "@hce/design-system";
import {
  HceFormModal,
  hceColors,
  hceTypography,
  GenericTable,
  Box,
  UiCloseIcon,
} from "@hce/design-system";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@hce/i18n-core";
import { useEmergencyNamespaceReady } from "../../i18n";

export interface AditionalInfoModalProps {
  open: boolean;
  onClose: () => void;
  /** Nombre del paciente al que se asigna el médico (opcional, para mostrar en el modal) */
  paciente?: MonitorTableRow;

  onSaveChanges?: (paciente: MonitorTableRow) => void | Promise<void>;
}

const createInfoColumns = ({
  canReadVIP,
  onChangeVIP,
  onChangeDischarge,
  t,
}: {
  canReadVIP: boolean;
  onChangeVIP: (row: MonitorTableRow, checked: boolean) => void;
  onChangeDischarge: (row: MonitorTableRow) => void;
  t: (key: string) => string;
}): GenericTableColumn<MonitorTableRow>[] => [
  {
    key: "waitingBoxTime",
    header: t("AditionalInfoModal.colWaitingBox"),
    type: "waiting-time",
    field: "waiting_time_box_display",
    colorField: "waiting_time_box_color",
    width: 200,
    align: "center",
  },
  {
    key: "waitingPhysicianTime",
    header: t("AditionalInfoModal.colWaitingPhysician"),
    type: "waiting-time",
    field: "waiting_time_physician_display",
    colorField: "waiting_time_physician_color",
    width: 200,
    align: "center",
  },
  {
    key: "attentionDate",
    header: t("AditionalInfoModal.colAttentionDate"),
    type: "text",
    field: "attentionDate",
    width: 120,
    align: "center",
    boldGetter: (row) => row.has_discharge,
  },
  {
    key: "attentionHour",
    header: t("AditionalInfoModal.colAttentionHour"),
    type: "text",
    field: "attentionHour",
    width: 80,
    align: "center",
    boldGetter: (row) => row.has_discharge,
  },
  {
    key: "dischargeDate",
    header: t("AditionalInfoModal.colDischargeDate"),
    type: "text",
    field: "dischargeDate",
    width: 100,
    align: "center",
    boldGetter: (row) => row.has_discharge,
  },
  {
    key: "dischargeHour",
    header: t("AditionalInfoModal.colDischargeHour"),
    type: "text",
    field: "dischargeHour",
    width: 80,
    align: "center",
    boldGetter: (row) => row.has_discharge,
  },
  {
    key: "vip",
    header: t("AditionalInfoModal.colVip"),
    type: "switch",
    field: "is_vip",
    width: 150,
    align: "center",
    disabledGetter: () => !canReadVIP,
    onClick: (row, checked) => onChangeVIP(row, Boolean(checked)),
    getCellTestId: (row) => `mf-emergency-additional-info-modal-vip-${row.id}`,
  },
  {
    key: "has_discharge",
    header: t("AditionalInfoModal.colUndoDischarge"),
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
      onChangeDischarge(row);
    },
    getCellTestId: (row) =>
      `mf-emergency-additional-info-modal-discharge-${row.id}`,
  },
];

export function AditionalInfoModal({
  open,
  onClose,
  paciente,
  onSaveChanges,
}: AditionalInfoModalProps) {
  // Registro del namespace SÍNCRONO, en el cuerpo del componente — no en
  // useEffect. addResourceBundle() no es async, así que no hay razón para
  // esperar al efecto: si se registra ahí, el primer render (justo el que
  // arma columns con t()) puede ocurrir ANTES de que el namespace exista,
  // dejando las claves crudas "horneadas" dentro del useMemo para siempre.
  const namespaceReady = useEmergencyNamespaceReady();
  const { t } = useTranslation("emergency");

  const canReadVIP = true;

  const [localPaciente, setLocalPaciente] = useState<MonitorTableRow | null>(
    paciente ?? null,
  );

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLocalPaciente(paciente ? { ...paciente } : null);
    setHasChanges(false);
  }, [open, paciente]);

  const handleVIPClick = useCallback(
    (row: MonitorTableRow, checked: boolean) => {
      setLocalPaciente((prev) => {
        if (!prev || prev.id !== row.id) return prev;

        setHasChanges(true);

        const updated = {
          ...prev,
          is_vip: checked,
        };

        console.info("Cambios en paciente VIP:", updated);

        return updated;
      });
    },
    [],
  );

  const handleClose = useCallback(async () => {
    if (hasChanges && localPaciente) {
      await onSaveChanges?.(localPaciente);
    }

    onClose();
  }, [hasChanges, localPaciente, onClose, onSaveChanges]);

  const handleDischargeClick = useCallback((row: MonitorTableRow) => {
    setLocalPaciente((prev) => {
      if (!prev || prev.id !== row.id) return prev;

      setHasChanges(true);

      const updated = {
        ...prev,
        has_discharge: !prev.has_discharge,
        dischargeDate: "-",
        dischargeHour: "-",
      };
      console.info("Cambios en paciente con alta:", updated);
      return updated;
    });
  }, []);

  const columns = useMemo(
    () =>
      createInfoColumns({
        canReadVIP,
        onChangeVIP: handleVIPClick,
        onChangeDischarge: handleDischargeClick,
        t,
      }),
    [canReadVIP, handleVIPClick, handleDischargeClick, t], // ← "t" agregado
  );

  if (!namespaceReady) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        Cargando...
      </Box>
    );
  }

  return (
    <HceFormModal
      open={open}
      onClose={handleClose}
      title={t("AditionalInfoModal.title")}
      maxWidth="xl"
      buttonAlign="right"
      testId="mf-emergency-additional-info-modal"
    >
      {/* El HceModal acepta children opcionales — aquí metemos el select */}

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
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
            {t("AditionalInfoModal.loadingPatient")}
          </Box>
        ) : (
          <Box sx={{ flex: 1, minHeight: 0, overflowX: "auto" }}>
            <GenericTable
              rows={[localPaciente]}
              columns={columns}
              getRowId={(row) => row.id}
              getRowTestId={(row) =>
                `mf-emergency-additional-info-modal-row-${row.id}`
              }
              maxHeight="100%"
            />
          </Box>
        )}
      </Box>
    </HceFormModal>
  );
}
