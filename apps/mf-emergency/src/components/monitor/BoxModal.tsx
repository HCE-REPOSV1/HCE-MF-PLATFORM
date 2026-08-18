import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  HceFormModal,
  hceColors,
  hceTypography,
  Typography,
  HceModal,
  UiCheckedIcon,
  SelectField,
} from "@hce/design-system";

import type { MonitorTableRow } from "../../types/monitor.table.types";
import { useSede } from "../../hooks/useSede";
import {
  getAvailableBeds,
  reassignBed,
  type BedOption,
} from "../../services/bedManagement.service";
import { useUser } from "shell/UserContext";
import { useTranslation } from "@hce/i18n-core";
import { registerEmergencyNamespace } from "../../i18n";

export interface BoxModalProps {
  open: boolean;
  onClose: () => void;
  paciente?: MonitorTableRow;
  title?: string;
  type: "change" | "assign";

  onSaved?: () => void | Promise<void>;
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
  );

  const { t } = useTranslation("emergency");
  useEffect(() => {
    registerEmergencyNamespace();
  }, []);

  const [bedOptions, setBedOptions] = useState<BedOption[]>([]);
  const [selectedBedId, setSelectedBedId] = useState("");
  const [loadingBeds, setLoadingBeds] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sede = useSede();

  const user: string = useUser().user?.username ?? "";
  const locationId = sede?.id;

  useEffect(() => {
    if (!open) return;

    setLocalPaciente(paciente ? { ...paciente } : null);
    setSelectedBedId("");
    setBedOptions([]);
    setSaving(false);
    setLoadingBeds(false);
    setError(null);
  }, [open, paciente]);

  useEffect(() => {
    if (!open) return;

    if (!locationId) {
      setBedOptions([]);
      setLoadingBeds(false);
      setError(t("BoxModal.errors.noSede"));
      return;
    }

    let cancelled = false;

    const loadBeds = async () => {
      try {
        setLoadingBeds(true);
        setError(null);

        const beds = await getAvailableBeds(locationId);

        if (!cancelled) {
          setBedOptions(beds);
        }
      } catch (err) {
        if (!cancelled) {
          setBedOptions([]);
          setError(
            err instanceof Error
              ? err.message
              : t("BoxModal.errors.loadBedsFailed"),
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingBeds(false);
        }
      }
    };

    void loadBeds();

    return () => {
      cancelled = true;
    };
  }, [open, locationId]);

  const modalTitle = useMemo(() => {
    if (title) return title;

    return type === "assign" ? t("BoxModal.titleAssign") : t("BoxModal.titleChange");
  }, [title, type]);

  const contentTitle = useMemo(() => {
    if (type === "assign") return null;

    return t("BoxModal.contentTitle");
  }, [type]);

  const patientName = localPaciente?.patient_name ?? "-";

  const handleCancel = useCallback(() => {
    if (saving) return;

    onClose();
  }, [onClose, saving]);

  const handleSave = useCallback(async () => {
    if (!localPaciente || !selectedBedId) return;

    try {
      setSaving(true);
      setError(null);

      await reassignBed({
        encounter_id: Number(localPaciente.encounter_id),
        bed_id: Number(selectedBedId),
        assigned_by: user,
        user_create: user,
      });

      setConfirm(true);
    } catch (err) {
      setSaving(false);
      setError(
        err instanceof Error ? err.message : t("BoxModal.errors.assignFailed"),
      );
    }
  }, [localPaciente, selectedBedId, user]);

  const handleConfirm = useCallback(async () => {
    try {
      setConfirm(false);
      onClose();
      await onSaved?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("BoxModal.errors.refreshFailed"),
      );
    } finally {
      setSaving(false);
    }
  }, [onSaved, onClose]);

  const isSaveDisabled =
    !selectedBedId || loadingBeds || saving || !localPaciente || Boolean(error);

  return (
    <>
      <HceModal
        maxWidth={400}
        open={confirm}
        title={t("BoxModal.savedSuccessTitle")}
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
            label: saving ? t("BoxModal.saving") : t("BoxModal.save"),
            onClick: handleSave,
            color: "var(--ds-color-interactive-button)",
            disabled: isSaveDisabled,
          }}
          secondaryButton={{
            label: t("BoxModal.cancel"),
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
                {t("BoxModal.loadingPatient")}
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
                    {t("BoxModal.patientLabel")}
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
                    label={t("BoxModal.bedsLabel")}
                    value={selectedBedId}
                    onChange={setSelectedBedId}
                    options={bedOptions.map((bed) => ({
                      value: bed.id,
                      label: bed.label,
                    }))}
                    placeholder={
                      loadingBeds
                        ? t("BoxModal.loadingBedsPlaceholder")
                        : bedOptions.length === 0
                          ? t("BoxModal.noBedsPlaceholder")
                          : t("BoxModal.selectPlaceholder")
                    }
                    disabled={
                      loadingBeds ||
                      saving ||
                      !locationId ||
                      bedOptions.length === 0
                    }
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
    </>
  );
}
