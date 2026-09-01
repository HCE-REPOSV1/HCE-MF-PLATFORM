import {
  Box,
  Checkbox,
  Grid,
  HceFormModal,
  SegmentedToggle,
  SelectField,
  TextInput,
  hceColors,
  hceTypography,
} from "@hce/design-system";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCatalog } from "../../hooks/useCatalog";
import type { CatalogBackgroundItem } from "../../types/Catalog.type";

type PatientBackgroundCategory = "general" | "gyn_obstetric" | "pathological";

export interface NewPatientBackgroundPayload {
  background_catalog_id: number;
  background_name: string;
  background_category: PatientBackgroundCategory;
  is_present: boolean;
  description: string;
}

export interface AddPatientBackgroundModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: NewPatientBackgroundPayload) => void | Promise<void>;
  initialCategory?: PatientBackgroundCategory;
}

interface DraftItem {
  background_catalog_id: number;
  label: string;
  is_present: boolean;
  description: string;
  category: PatientBackgroundCategory;
}

export default function AddPatientBackgroundModal({
  open,
  onClose,
  onSave,
  initialCategory = "general",
}: AddPatientBackgroundModalProps) {
  const { t } = useTranslation("clinical-record");
  const { fetchBackgroundCatalog } = useCatalog();

  const [category, setCategory] =
    useState<PatientBackgroundCategory>(initialCategory);
  const [backgroundCatalog, setBackgroundCatalog] = useState<
    CatalogBackgroundItem[]
  >([]);
  const [backgroundCatalogId, setBackgroundCatalogId] = useState<string>("");
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCatalog = async () => {
      const data = await fetchBackgroundCatalog();
      setBackgroundCatalog(data ?? []);
    };
    loadCatalog();
  }, [fetchBackgroundCatalog]);

  useEffect(() => {
    if (!open) return;
    setCategory(initialCategory);
    setBackgroundCatalogId("");
    setDraftItems([]);
    setError(null);
  }, [open, initialCategory]);

  const allBackgroundCatalogOptions = useMemo(
    () =>
      backgroundCatalog
        .filter(
          (item) => item.background_category === category && item.is_active,
        )
        .map((item) => ({
          value: String(item.background_catalog_id),
          label: item.background_name,
        })),
    [backgroundCatalog, category],
  );

  const backgroundCatalogOptions = useMemo(
    () =>
      allBackgroundCatalogOptions.filter(
        (opt) =>
          !draftItems.some(
            (item) =>
              item.background_catalog_id === Number(opt.value) &&
              item.category === category,
          ),
      ),
    [allBackgroundCatalogOptions, draftItems, category],
  );

  const handleSelectFromCatalog = useCallback(
    (value: string) => {
      const id = Number(value);
      const option = allBackgroundCatalogOptions.find(
        (opt) => opt.value === value,
      );
      if (!option) return;

      setDraftItems((prev) => {
        if (
          prev.some(
            (item) =>
              item.background_catalog_id === id && item.category === category,
          )
        )
          return prev;
        return [
          ...prev,
          {
            background_catalog_id: id,
            label: option.label,
            is_present: true,
            description: "",
            category,
          },
        ];
      });

      setBackgroundCatalogId("");
    },
    [allBackgroundCatalogOptions, category],
  );

  const updateDraftItem = useCallback(
    (
      id: number,
      itemCategory: PatientBackgroundCategory,
      patch: Partial<Pick<DraftItem, "description">>,
    ) => {
      setDraftItems((prev) =>
        prev.map((item) =>
          item.background_catalog_id === id && item.category === itemCategory
            ? { ...item, ...patch }
            : item,
        ),
      );
    },
    [],
  );

  const handleTogglePresent = useCallback(
    (
      id: number,
      itemCategory: PatientBackgroundCategory,
      checked: boolean,
    ) => {
      if (checked) return;
      setDraftItems((prev) =>
        prev.filter(
          (item) =>
            !(
              item.background_catalog_id === id &&
              item.category === itemCategory
            ),
        ),
      );
    },
    [],
  );

  const visibleDraftItems = useMemo(
    () => draftItems.filter((item) => item.category === category),
    [draftItems, category],
  );

  const isSaveDisabled = saving || draftItems.length === 0;

  const handleSave = useCallback(async () => {
    if (isSaveDisabled) return;
    try {
      setSaving(true);
      setError(null);
      for (const item of draftItems) {
        await onSave({
          background_catalog_id: item.background_catalog_id,
          background_name: item.label,
          background_category: item.category,
          is_present: item.is_present,
          description: item.description,
        });
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("addPatientBackgroundModal.saveError"),
      );
    } finally {
      setSaving(false);
    }
  }, [isSaveDisabled, draftItems, onSave, onClose, t]);

  return (
    <HceFormModal
      open={open}
      onClose={onClose}
      title={t("addPatientBackgroundModal.title")}
      maxWidth="md"
      buttonAlign="right"
      primaryButton={{
        label: t("addPatientBackgroundModal.saveButton"),
        onClick: handleSave,
        disabled: isSaveDisabled,
        color: hceColors.primary.green[600],
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
        <SegmentedToggle
          variant="panel"
          options={[
            { label: t("addPatientBackgroundModal.categories.general"), value: "general" },
            { label: t("addPatientBackgroundModal.categories.gynObstetric"), value: "gyn_obstetric" },
            { label: t("addPatientBackgroundModal.categories.pathological"), value: "pathological" },
          ]}
          value={category}
          onChange={(v) => setCategory(v as PatientBackgroundCategory)}
        />

        <Box
          sx={{
            backgroundColor: hceColors.primary.blue[50],
            border: `1px solid ${hceColors.primary.blue[600]}`,
            borderRadius: "0 0 12px 12px",
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            textAlign: "start",
          }}
        >
          <SelectField
            label={t("addPatientBackgroundModal.catalogLabel")}
            placeholder={t("addPatientBackgroundModal.catalogPlaceholder")}
            value={backgroundCatalogId}
            onChange={handleSelectFromCatalog}
            options={backgroundCatalogOptions}
          />

          {visibleDraftItems.map((item) => (
            <fieldset
              key={item.background_catalog_id}
              style={{
                border: `2px solid ${hceColors.primary.green[600]}`,
                borderRadius: "8px",
                padding: "10px",
                margin: "10px 0px",
              }}
            >
              <legend
                style={{
                  padding: "0 8px",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: hceColors.primary.blue[600],
                  fontFamily: hceTypography.fontFamily,
                }}
              >
                {item.label}
              </legend>
              <Grid container spacing={2} alignItems="center" wrap="nowrap">
                <Grid item xs="auto" zeroMinWidth>
                  <Checkbox
                    label={t("addPatientBackgroundModal.presentCheckbox")}
                    checked={item.is_present}
                    onChange={(v) =>
                      handleTogglePresent(
                        item.background_catalog_id,
                        item.category,
                        v,
                      )
                    }
                  />
                </Grid>
                <Grid item xs zeroMinWidth>
                  <TextInput
                    placeholder={t("addPatientBackgroundModal.descriptionPlaceholder")}
                    value={item.description}
                    onChange={(v) =>
                      updateDraftItem(
                        item.background_catalog_id,
                        item.category,
                        { description: v },
                      )
                    }
                  />
                </Grid>
              </Grid>
            </fieldset>
          ))}

          {error && (
            <Box
              sx={{
                color: hceColors.alert.error[600],
                fontFamily: hceTypography.fontFamily,
                fontSize: "0.875rem",
              }}
            >
              {error}
            </Box>
          )}
        </Box>
      </Box>
    </HceFormModal>
  );
}