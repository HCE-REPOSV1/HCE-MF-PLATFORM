import {
  AddCircleIcon,
  Box,
  Button,
  Grid,
  hceColors,
  HceFormModal,
  RadioGroup,
  SearchComboInput,
  SelectField,
  TextInput,
  type SearchOption,
} from "@hce/design-system";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCatalog } from "../../hooks/useCatalog";
import type { CatalogAdministrationRoute } from "../../types/Catalog.type";
import { getLocalizedCatalogDisplay } from "../../utils/catalogLocalization";

export interface NewMedicationReconciliationPayload {
  medication_legacy_code: string;
  medication_name: string;
  administration_route_id: number;
  administration_route_description: string;
  dose_value: number;
  frequency_value: number;
  last_dose_datetime: string;
  reconciliation_action: string;
}

export interface AddMedicationReconciliationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: NewMedicationReconciliationPayload) => void | Promise<void>;
}

// Item crudo devuelto por la búsqueda de productos — se infiere del propio
// hook para no depender de que Catalog.type.tsx tenga (o no) un campo
// medication_legacy_code declarado explícitamente.
interface MedicationSearchResultItem {
  medication_legacy_code: string;
  product_display: string;
}

export default function AddMedicationReconciliationModal({
  open,
  onClose,
  onSave,
}: AddMedicationReconciliationModalProps) {
  const { t, i18n } = useTranslation("clinical-record");
  const { fetchAdministrationRoutes, fetchMedicationProductsSearch } =
    useCatalog();

  const RECONCILIATION_ACTION_OPTIONS = useMemo(
    () => [
      { value: "continue", label: t("reconciliationActions.continue") },
      { value: "suspend", label: t("reconciliationActions.suspend") },
      { value: "modify", label: t("reconciliationActions.modify") },
    ],
    [t],
  );

  // ── Búsqueda de medicamento ──────────────────────────────────────────────
  // SearchOption.value es siempre number en el design system, pero acá el
  // identificador real que necesitamos (medication_legacy_code) es un
  // string. Se usa el índice del array como "value" numérico solo para
  // satisfacer el tipo del componente, y se guardan los resultados crudos
  // aparte para recuperar el legacy_code real al seleccionar.
  const [medicationSearchText, setMedicationSearchText] = useState("");
  const [medicationOptions, setMedicationOptions] = useState<SearchOption[]>(
    [],
  );
  const [medicationSearchResults, setMedicationSearchResults] = useState<
    MedicationSearchResultItem[]
  >([]);
  const [medicationSearchLoading, setMedicationSearchLoading] = useState(false);
  const [selectedMedicationId, setSelectedMedicationId] = useState<string>("");

  const handleMedicationSearch = useCallback(
    async (query: string) => {
      setMedicationSearchLoading(true);
      const results = await fetchMedicationProductsSearch(query);
      setMedicationSearchResults(results ?? []);
      setMedicationOptions(
        (results ?? []).map((item, index) => ({
          value: index,
          label: item.product_display,
        })),
      );
      setMedicationSearchLoading(false);
    },
    [fetchMedicationProductsSearch],
  );

  const handleMedicationSelect = useCallback(
    (opt: SearchOption) => {
      const selected = medicationSearchResults[opt.value as number];
      if (!selected) return;

      setSelectedMedicationId(selected.medication_legacy_code);
      setMedicationSearchText(opt.label);
      setMedicationOptions([]);
    },
    [medicationSearchResults],
  );

  // ── Catálogo de vías de administración ───────────────────────────────────
  const [administrationRoutes, setAdministrationRoutes] = useState<
    CatalogAdministrationRoute[]
  >([]);

  useEffect(() => {
    const loadRoutes = async () => {
      const data = await fetchAdministrationRoutes();
      setAdministrationRoutes(data ?? []);
    };
    loadRoutes();
  }, [fetchAdministrationRoutes]);

  const routeOptions = useMemo(
    () =>
      administrationRoutes
        .filter((item) => item.is_active)
        .map((item) => ({
          value: String(item.administration_route_id),
          label: getLocalizedCatalogDisplay(
            {
              description_es: item.description_es,
              description_en: item.description_en,
            },
            i18n.language,
            item.description,
          ), //item.description,
        })),
    [administrationRoutes, i18n.language],
  );

  // ── Resto del formulario ─────────────────────────────────────────────────
  const [route, setRoute] = useState("");
  const [doseValue, setDoseValue] = useState("");
  const [frequencyValue, setFrequencyValue] = useState("");
  const [lastDoseDate, setLastDoseDate] = useState("");
  const [lastDoseTime, setLastDoseTime] = useState("00:00");
  const [action, setAction] = useState("modify");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMedicationSearchText("");
    setMedicationOptions([]);
    setMedicationSearchResults([]);
    setSelectedMedicationId("");
    setRoute("");
    setDoseValue("");
    setFrequencyValue("");
    setLastDoseDate("");
    setLastDoseTime("00:00");
    setAction("modify");
  }, [open]);

  const selectedRouteLabel =
    routeOptions.find((opt) => opt.value === route)?.label ?? "";

  const isSaveDisabled =
    saving || !selectedMedicationId || !doseValue || !frequencyValue || !route;

  const handleSave = useCallback(async () => {
    if (isSaveDisabled || !selectedMedicationId) return;
    try {
      setSaving(true);
      await onSave({
        medication_legacy_code: selectedMedicationId,
        medication_name: medicationSearchText,
        administration_route_id: Number(route),
        administration_route_description: selectedRouteLabel,
        dose_value: Number(doseValue),
        frequency_value: Number(frequencyValue),
        last_dose_datetime:
          lastDoseDate && lastDoseTime
            ? `${lastDoseDate}T${lastDoseTime}:00`
            : "",
        reconciliation_action: action,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }, [
    isSaveDisabled,
    selectedMedicationId,
    medicationSearchText,
    route,
    selectedRouteLabel,
    doseValue,
    frequencyValue,
    lastDoseDate,
    lastDoseTime,
    action,
    onSave,
    onClose,
  ]);

  const handleDoseChange = (value: string) => {
    if (value === "" || /^\d+$/.test(value)) {
      setDoseValue(value);
    }
  };

  const handleFrequencyChange = (value: string) => {
    if (value === "" || /^\d+$/.test(value)) {
      setFrequencyValue(value);
    }
  };

  return (
    <HceFormModal
      open={open}
      onClose={onClose}
      title={t("addMedicationReconciliationModal.title")}
      maxWidth="xl"
      buttonAlign="right"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <SearchComboInput
          label={t("addMedicationReconciliationModal.medicationSearchLabel")}
          value={medicationSearchText}
          onChange={setMedicationSearchText}
          options={medicationOptions}
          onSearch={handleMedicationSearch}
          onSelect={handleMedicationSelect}
          loading={medicationSearchLoading}
          placeholder={t(
            "addMedicationReconciliationModal.medicationSearchPlaceholder",
          )}
          showModeToggle={false}
        />

        <Grid container spacing={2} alignItems="flex-end" wrap="nowrap">
          <Grid item xs={2} sm={1} zeroMinWidth>
            <TextInput
              label={t("addMedicationReconciliationModal.doseLabel")}
              type="number"
              placeholder={t(
                "addMedicationReconciliationModal.dosePlaceholder",
              )}
              value={doseValue}
              onChange={handleDoseChange}
            />
          </Grid>
          <Grid item xs={2} sm={1} zeroMinWidth>
            <TextInput
              label={t("addMedicationReconciliationModal.frequencyLabel")}
              type="number"
              placeholder={t(
                "addMedicationReconciliationModal.frequencyPlaceholder",
              )}
              value={frequencyValue}
              onChange={handleFrequencyChange}
            />
          </Grid>
          <Grid item xs={2} zeroMinWidth>
            <SelectField
              label={t("addMedicationReconciliationModal.routeLabel")}
              placeholder={t(
                "addMedicationReconciliationModal.routePlaceholder",
              )}
              value={route}
              onChange={setRoute}
              options={routeOptions}
            />
          </Grid>
          <Grid item xs={2} zeroMinWidth>
            <TextInput
              label={t("addMedicationReconciliationModal.lastDoseDateLabel")}
              type="date"
              value={lastDoseDate}
              onChange={setLastDoseDate}
            />
          </Grid>
          <Grid item xs={2} sm={1} zeroMinWidth>
            <TextInput
              label={t("addMedicationReconciliationModal.lastDoseTimeLabel")}
              type="time"
              value={lastDoseTime}
              onChange={setLastDoseTime}
            />
          </Grid>
          <Grid item xs="auto" zeroMinWidth>
            <Box sx={{ mt: "22px" }}>
              <RadioGroup
                value={action}
                onChange={(v) => setAction(v as string)}
                options={RECONCILIATION_ACTION_OPTIONS}
              />
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            startIcon={<AddCircleIcon />}
            color={hceColors.primary.green[600]}
            onClick={handleSave}
            disabled={isSaveDisabled}
          >
            {t("addMedicationReconciliationModal.addButton")}
          </Button>
        </Box>
      </Box>
    </HceFormModal>
  );
}
