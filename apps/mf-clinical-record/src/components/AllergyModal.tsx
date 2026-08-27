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
import { useCatalog } from "../hooks/useCatalog";
import { usePermission } from "../hooks/usePermission";
import { PERMISSIONS_CLINICAL_RECORD } from "../config/permissions";
import { mapAllergyApiItemToAvailabilityItem, type AllergyForm } from "../mapper/allergy.mapper";

export interface AllergyModalProps {
  open: boolean;
  onClose: () => void;
  /** id para identificar la alergia) */
  encounterId?: string;

  mode?: "read" | "write";
  onSaveChanges?: () => void | Promise<void>;
}

const EMPTY_FORM: AllergyForm = {
  allergy_id: "1",
  encounter_id: "1",
  has_allergy: false,
  api: [],
  food: "",
  other: "",
};

const createInfoColumns = ({
  canEdit,
  onEdit,
}: {
  canEdit: boolean;
  onEdit: (row: AllergyForm) => void;
}): GenericTableColumn<AllergyForm>[] => [
  {
    key: "API",
    header: "Principio activo",
    type: "list",
    field: "api",
    width: 100,
    align: "left",
  },
  {
    key: "food",
    header: "Alimentos",
    type: "text",
    field: "food",
    width: 100,
    align: "center",
  },
  {
    key: "other",
    header: "Otros",
    type: "text",
    field: "other",
    width: 100,
    align: "center",
  },

  {
    key: "on_edit",
    header: "Editar",
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

const allergyExample: AllergyForm[] = [
  {
    allergy_id: "1",
    encounter_id: "1",
    has_allergy: false,
    api: [],
    food: null,
    other: null,
  },
];

export default function AllergyModal({
  open,
  onClose,
  onSaveChanges,
  mode = "write",
  encounterId,
}: AllergyModalProps) {
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

  const [enabledAlergiasTriage, setEnabledAlergiasTriage] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [valuePrincipioActivo, setValuePrincipioActivo] = useState<string[]>(
    [],
  );

  //const { fetchAllergyFull, loading: loadingAllergyFull } = useAllergyFull();

  const allergyBoard = useMemo(
    () => allergyExample.map(mapAllergyApiItemToAvailabilityItem),
    [allergyExample],
  );

  const opcionesRadioAlergia = [
    { value: true, label: "Si" },
    { value: false, label: "Niega alergias" },
  ];

  const { fetchCatalogActivePrinciples } = useCatalog();

  const handleSave = useCallback(async () => {
    if (readOnly) return;
    try {
      setSaving(true);
      setError(null);

      await onSaveChanges?.();
    } catch (err) {
      setSaving(false);
      setError(
        err instanceof Error ? err.message : "No se pudo editar la alergia",
      );
    } finally {
      setallergyEditionOpen(false);
      setSaving(false);
    }
  }, [onSaveChanges, readOnly]);

  //const [hasChanges, setHasChanges] = useState(false)

  const handleConfirm = useCallback(async () => {
    try {
      setConfirm(false);
      if (allergySelected) {
        setForm({ ...allergySelected });
        setValuePrincipioActivo([...allergySelected.api]);
      }
      setallergyEditionOpen(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo refrescar la información",
      );
    } finally {
      setConfirm(false);
    }
  }, [allergySelected]);

  const handleCancel = useCallback(() => {
    setAllergySelected(undefined);
    setConfirm(false);
  }, []);

  const handleEdit = useCallback(async (row: AllergyForm) => {
    setConfirm(true);
    setAllergySelected(row);
  }, []);

  const handleClose = useCallback(async () => {
    setForm(EMPTY_FORM);
    setValuePrincipioActivo([]);
    setAllergySelected(undefined);
    setallergyEditionOpen(false);
    setConfirm(false);
    onClose();
  }, [onClose]);

  const columns = useMemo(
    () =>
      createInfoColumns({
        canEdit,
        onEdit: handleEdit,
      }),
    [canEdit, handleEdit],
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

  const isSaveDisabled = saving || Boolean(error);
  //||
  // (!form.tieneAlergia?  ),

  const set = useCallback(
    <K extends keyof AllergyForm>(key: K, val: AllergyForm[K]) => {
      setForm((f:any) => ({ ...f, [key]: val }));
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
        setLoadError(
          "No se pudo cargar la información de catálogos. Recargue el formulario.",
        );
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    setEnabledAlergiasTriage(!(readOnly || encounterId === "read"));
  }, [readOnly, encounterId]);

  return (
    <>
      <HceModal
        maxWidth={400}
        open={confirm}
        title="¿Desea continuar con la edición de las alergias declaradas?"
        icon={<UiWarningIcon />}
        confirmButton={{
          label: "Aceptar",
          onClick: handleConfirm,
        }}
        cancelButton={{
          label: "Cancelar",
          onClick: handleCancel,
        }}
      />

      {!confirm && (
        <HceFormModal
          open={open && !loadError}
          onClose={handleClose}
          title="Declaratoria de alergias "
          maxWidth={allergyEditionOpen ? "md" : 1200}
          buttonAlign="right"
        >
          {/* El HceModal acepta children opcionales — aquí metemos el select */}
          <Box sx={{ textAlign: "center", mt: 1 }}>
            {!allergyBoard ? (
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
            ) : !allergyEditionOpen ? (
              <GenericTable
                rows={allergyBoard}
                columns={columns}
                getRowId={(row:any) => row.allergy_id}
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
                            if (v == false) {
                              setValuePrincipioActivo([]);
                              set("food", "");
                              set("other", "");
                            }
                          }}
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
                          label="Principio activo"
                          value={valuePrincipioActivo}
                          onChange={(values) => {
                            setValuePrincipioActivo(values);
                            set("api", values);
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: "20px" }}>
                  <TextareaField
                    label="Alimentos"
                    value={form.food || ''}
                    onChange={(v) => set("food", v)}
                    maxLength={100}
                    placeholder="Describa alergias alimentarias"
                    disabled={
                      !canAlergiasTriage ||
                      !enabledAlergiasTriage ||
                      form.has_allergy == false
                    }
                  />
                </Box>
                <Box sx={{ mt: "20px" }}>
                  <TextareaField
                    label="Otros"
                    value={form.other ||'' }
                    onChange={(v) => set("other", v)}
                    maxLength={100}
                    placeholder="Otros tipos de alergia"
                    disabled={
                      !canAlergiasTriage ||
                      !enabledAlergiasTriage ||
                      form.has_allergy == false
                    }
                  />
                </Box>
              </Box>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "end" }}>
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
                      aria-label="Aceptar"
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
                      Aceptar
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
