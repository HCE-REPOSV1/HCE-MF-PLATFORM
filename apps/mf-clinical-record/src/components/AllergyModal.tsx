import type { GenericTableColumn } from "@hce/design-system";
import {
  HceFormModal,
  hceColors,
  hceTypography,
  GenericTable,
  Box,
  RadioGroup,
  UiEditingIcon,
  HceModal,
  UiWarningIcon,
  MultiSelect,
  TextareaField,
  Grid,
  Button,
} from "@hce/design-system";
import { useCallback, useEffect, useMemo, useState } from "react";
import { mapAllergyApiToForm, type AllergyForm, type AllergyTableItem } from "../mapper/allergy.mapper";
import { useTranslation } from "@hce/i18n-core";
import { usePermission } from "../hooks/usePermission";
import { PERMISSIONS_CLINICAL_RECORD } from "../config/permissions";
import { useUser } from "shell/UserContext";
import { useCatalog } from "../hooks/useCatalog";
import { useAllergyDeclaration } from "../hooks/useAllergyDeclaration";
import { updateAllergyDeclaration } from "../services/allergy.service";
import { resolveApiError } from "../i18n/errorCodes";



export interface AllergyModalProps {
  open: boolean;
  onClose: () => void;
  /** id para identificar la alergia) */
  encounterId?: number;

  mode?: "read" | "write";
  onSaveChanges?: (
  ) => void | Promise<void>;
}

const EMPTY_FORM: AllergyForm = {
  allergy_id: 1,
  encounter_id: 1,
  has_allergy: false,
  api: [],
  food: "",
  other: "",
};

const createInfoColumns = ({
  canEdit,
  onEdit,
  labels,
}: {
  canEdit: boolean;
  onEdit: (row: AllergyTableItem) => void;
  labels: {
    activeIngredient: string;
    food: string;
    other: string;
    edit: string;
  };
}): GenericTableColumn<AllergyTableItem>[] => [
  {
  key: "API",
  header: labels.activeIngredient,
  type: "list",
  field: "apiLabels",
  width: 100,
  align: "left",
},
  {
    key: "food",
    header: labels.food,
    type: "text",
    field: "food",
    width: 100,
    align: "center",
  },
  {
    key: "other",
    header: labels.other,
    type: "text",
    field: "other",
    width: 100,
    align: "center",
  },

  {
    key: "on_edit",
    header: labels.edit,
    type: "icon",
    field: "edit",
    icon: UiEditingIcon,
    iconSize: 18,
    width: 20,
    align: "center",
    clickable: true,
    disabledGetter: () => !canEdit,
    colorGetter: () => (canEdit ? "var(--ds-color-interactive-button, #0043a5)" : "#A0A0A0"),
    onClick: (row) => {
      onEdit(row);
    },
  },
];

export function AllergyModal({
  open,
  onClose,
  onSaveChanges,
  mode = "write",
  encounterId,
}: AllergyModalProps) {
  const { t } = useTranslation("clinical-record");
  const readOnly = mode === "read";
  const canEdit = usePermission(PERMISSIONS_CLINICAL_RECORD.allergy.write);

  const [form, setForm] = useState<AllergyForm>(EMPTY_FORM);

  const [allergyEditionOpen, setallergyEditionOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optionsActivePrinciples, setOptionsActivePrinciples] = useState<
    { value: string; label: string }[]
  >([]);
  const canAlergiasTriage = usePermission(PERMISSIONS_CLINICAL_RECORD.allergy.base);

  const [allergySelected, setAllergySelected] = useState<AllergyForm>();

  const enabledAlergiasTriage = !readOnly;
  const [loadError, setLoadError] = useState<string | null>(null);

  const [valuePrincipioActivo, setValuePrincipioActivo] = useState<string[]>(
    [],
  );

   const user: string = useUser().user?.username ?? "";
  const opcionesRadioAlergia = useMemo(
    () => [
      { value: true, label: t("allergy.yes") },
      { value: false, label: t("allergy.deniesAllergies") },
    ],
    [t],
  );

  const { fetchCatalogActivePrinciples } = useCatalog();

  const {
    data: allergyDeclaration,
    loading: allergyDeclarationLoading,
    error: allergyDeclarationError,
    refetch: refetchAllergyDeclaration,
  } = useAllergyDeclaration(encounterId);

const allergyBoard = useMemo<AllergyTableItem[]>(() => {
  const declaration = allergyDeclaration?.declaration;

  if (!declaration) return [];

  const activePrincipleNames = new Map(
    optionsActivePrinciples.map(({ value, label }) => [
      value,
      label,
    ]),
  );

  const allergyForm = mapAllergyApiToForm({
    ...declaration,
    encounter_id: allergyDeclaration.encounter_id,
  });

  return [
    {
      ...allergyForm,

      apiLabels: allergyForm.api.map(
        (id) =>
          activePrincipleNames.get(id) ??
          t(
            "allergy.activeIngredientWithId",
            { id },
          ),
      ),
    },
  ];
}, [allergyDeclaration, optionsActivePrinciples, t]);

const hasChanges = useMemo(() => {
  const original = allergyBoard[0];

  if (!original) return false;

  const sameActivePrinciples =
    original.api.length === form.api.length &&
    original.api.every((id) => form.api.includes(id));

  return (
    original.has_allergy !== form.has_allergy ||
    !sameActivePrinciples ||
    original.food !== form.food ||
    original.other !== form.other
  );
}, [allergyBoard, form]);

const handleSave = useCallback(async () => {
    if (readOnly || !hasChanges) return;

    if (!allergyDeclaration) return;

    try {
      setSaving(true);
      setError(null);

      await updateAllergyDeclaration(
        allergyDeclaration.encounter_id,
        {
          has_allergies:
            form.has_allergy ? "S" : "N",

          food_allergies:
            form.food || null,

          other_allergies:
            form.other || null,

          active_principle_ids:
            form.api.map(Number),

          user_modify: user,
        },
      );

      await refetchAllergyDeclaration();
      await onSaveChanges?.();
      setallergyEditionOpen(false);

     

    } catch (err: unknown) {
      setError(
        t('common:'+ resolveApiError(err)),
      );
    } finally {
      setSaving(false);
    }
  }, [
    form,
    hasChanges,
    allergyDeclaration,
    onSaveChanges,
    readOnly,
    refetchAllergyDeclaration,
    t,
    user,
  ]);

  //const [hasChanges, setHasChanges] = useState(false)

  const handleConfirm = useCallback(async () => {
    try {
      setConfirm(false);
      setError(null);
      if (allergySelected) {
        setForm({ ...allergySelected });
        setValuePrincipioActivo([...allergySelected.api]);
      }
      setallergyEditionOpen(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("allergy.refreshError"),
      );
    } finally {
      setConfirm(false);
    }
  }, [allergySelected, t]);

  const handleCancel = useCallback(() => {
    setAllergySelected(undefined);
    setConfirm(false);
  }, []);

  const handleEdit = useCallback((row: AllergyTableItem) => {
    setAllergySelected({
    allergy_id: row.allergy_id,
    encounter_id: row.encounter_id,
    has_allergy: row.has_allergy,
    api: [...row.api],
    food: row.food,
    other: row.other,
  });

  setConfirm(true);
}, []);
  

  const handleClose = useCallback(async () => {
    setForm(EMPTY_FORM);
    setValuePrincipioActivo([]);
    setAllergySelected(undefined);
    setallergyEditionOpen(false);
    setConfirm(false);
    setError(null);
    onClose();
  }, [onClose]);

  const columns = useMemo(
    () =>
      createInfoColumns({
        canEdit,
        onEdit: handleEdit,
        labels: {
          activeIngredient: t("allergy.activeIngredient"),
          food: t("allergy.food"),
          other: t("allergy.other"),
          edit: t("allergy.edit"),
        },
      }),
    [canEdit, handleEdit, t],
  );

  const activePrincipleOptions = useMemo(() => {
    const catalogValues = new Set(
      optionsActivePrinciples.map(({ value }) => value),
    );
    const rawOptions = valuePrincipioActivo
      .filter((value) => !catalogValues.has(value))
      .map((value) => ({ value, label: value }));

    return [...optionsActivePrinciples, ...rawOptions];
  }, [optionsActivePrinciples, valuePrincipioActivo]);

  const isSaveDisabled =
  saving ||
  !hasChanges;
  //||
  // (!form.tieneAlergia?  ),

  const set = useCallback(
    <K extends keyof AllergyForm>(key: K, val: AllergyForm[K]) => {
      setForm((f) => ({ ...f, [key]: val }));
    },
    
    [],
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const results = await Promise.all([fetchCatalogActivePrinciples()]);
        const [activePrinciples] = results;

        if (activePrinciples && Array.isArray(activePrinciples)) {
          const transformerOptions = activePrinciples
            .filter((p) => p.is_active)
            .map(({ active_principle_id, substance_name }) => ({
              value: String(active_principle_id),
              label: substance_name,
            }));
          setOptionsActivePrinciples(transformerOptions);
        }
      } catch (err) {
        console.error("Error al cargar información", err);
        setLoadError(t("allergy.catalogError"));
      }
    };

    loadData();
  }, [fetchCatalogActivePrinciples, t]);

  return (
    <>
      <HceModal
        maxWidth={400}
        open={confirm}
        title={t("allergy.confirmEdit")}
        icon={<UiWarningIcon />}
        confirmButton={{
          label: t("allergy.accept"),
          onClick: handleConfirm,
        }}
        cancelButton={{
          label: t("allergy.cancel"),
          onClick: handleCancel,
        }}
        testId="mf-clinical-record-allergy-confirm-modal"
      />

      {!confirm && (
        <HceFormModal
          open={open && !loadError}
          onClose={handleClose}
          title={t("allergy.title")}
          maxWidth={allergyEditionOpen ? "md" : 1200}
          buttonAlign="right"
          testId="mf-clinical-record-allergy-modal"
        >
          {/* El HceModal acepta children opcionales — aquí metemos el select */}
          <Box sx={{ textAlign: "center", mt: 1 }}>
            {allergyDeclarationLoading ? (
              <Box
                sx={{
                  py: 1.5,
                  textAlign: "center",
                  fontFamily: hceTypography.fontFamily,
                  fontSize: "0.875rem",
                  color: hceColors.neutro.black[300],
                }}
              >
                {t("allergy.loading")}
              </Box>
            ) : allergyDeclarationError ? (
              <Box
                sx={{
                  py: 1.5,
                  textAlign: "center",
                  fontFamily: hceTypography.fontFamily,
                  fontSize: "0.875rem",
                  color: hceColors.neutro.black[300],
                }}
              >
                {t("allergy.loadError")}
              </Box>
            ) : allergyBoard.length === 0 ? (
              <Box
                sx={{
                  py: 1.5,
                  textAlign: "center",
                  fontFamily: hceTypography.fontFamily,
                  fontSize: "0.875rem",
                  color: hceColors.neutro.black[300],
                }}
              >
                {t("allergy.empty")}
              </Box>
            ) : !allergyEditionOpen ? (
              <GenericTable
                rows={allergyBoard}
                columns={columns}
                getRowId={(row) => String(row.allergy_id)}
                maxHeight="100%"
              />
            ) : (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    textAlign: "start",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      textAlign: "start",
                    }}
                  >
                  <Grid container spacing={2} alignItems="flex-end" wrap="nowrap">
                  <Grid item xs={12} sm={4} md={4} zeroMinWidth>
                        <RadioGroup
                          disabled={
                            !canAlergiasTriage || !enabledAlergiasTriage
                          }
                          value={form.has_allergy}
                          options={opcionesRadioAlergia}
                          onChange={(v) => {
                            set("has_allergy", v);

                            if (v === false) {
                              setValuePrincipioActivo([]);
                              set("api", []); // <-- IMPORTANTE
                              set("food", "");
                              set("other", "");
                            }
                          }}
                          testId="mf-clinical-record-allergy-modal-radio"
                        />
                      </Grid>

                      <Grid item xs={12} sm={8} md={8} zeroMinWidth>
                        <MultiSelect
                          disabled={
                            !canAlergiasTriage ||
                            !enabledAlergiasTriage ||
                            !form.has_allergy
                          }
                          options={activePrincipleOptions}
                          label={t("allergy.activeIngredient")}
                          value={valuePrincipioActivo}
                          onChange={(values) => {
                            setValuePrincipioActivo(values);
                            set("api", values);
                          }}
                          testId="mf-clinical-record-allergy-modal-active-principle"
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: "20px" }}>
                  <TextareaField
                    label={t("allergy.food")}
                    value={form.food || ''}
                    onChange={(v) => set("food", v)}
                    maxLength={100}
                    placeholder={t("allergy.foodPlaceholder")}
                    disabled={
                      !canAlergiasTriage ||
                      !enabledAlergiasTriage ||
                      form.has_allergy == false
                    }
                    testId="mf-clinical-record-allergy-modal-food"
                  />
                </Box>
                <Box sx={{ mt: "20px" }}>
                  <TextareaField
                    label={t("allergy.other")}
                    value={form.other ||'' }
                    onChange={(v) => set("other", v)}
                    maxLength={100}
                    placeholder={t("allergy.otherPlaceholder")}
                    disabled={
                      !canAlergiasTriage ||
                      !enabledAlergiasTriage ||
                      form.has_allergy == false
                    }
                    testId="mf-clinical-record-allergy-modal-other"
                  />
                </Box>
              </Box>
                  </Box>

                  {error && (
                    <Box
                      role="alert"
                      sx={{
                        mt: "10px",
                        color: "#b42318",
                        fontFamily: hceTypography.fontFamily,
                        fontSize: "0.875rem",
                      }}
                    >
                      {error}
                    </Box>
                  )}

                  <Box sx={{ display: "flex", justifyContent: "end", mt:"10px" }}>
                    <Button
                      variant="contained"
                      color={"var(--ds-color-interactive-button)"}
                      hoverColor={"var(--ds-color-interactive-button)"}
                      hoverShadow="none"
                      focusRingColor={"var(--ds-color-interactive)"}
                      disabledBackground={hceColors.neutro.black[50]}
                      disabledColor={hceColors.neutro.black[200]}
                      onClick={handleSave}
                      disabled={isSaveDisabled}
                      aria-label={t("allergy.accept")}
                      testId="mf-clinical-record-allergy-modal-save"
                      sx={{
                        fontFamily: hceTypography.fontFamily,
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        textTransform: "none",
                        borderRadius: "6px",
                        minWidth: "100px",
                        height: "36px",
                      }}
                    >
                      {t("allergy.accept")}
                    </Button>
                  </Box>
                </Box>
         
            )}
          </Box>
        </HceFormModal>
      )}
    </>
  );
}