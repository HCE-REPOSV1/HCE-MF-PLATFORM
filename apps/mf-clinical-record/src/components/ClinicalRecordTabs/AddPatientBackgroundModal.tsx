import {
  Box,
  Button,
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
import { useCatalog } from "../../hooks/useCatalog";
import type { CatalogBackgroundItem } from "../../types/Catalog.type";

type PatientBackgroundCategory = "general" | "gyn_obstetric" | "pathological";

export interface NewPatientBackgroundPayload {
  background_catalog_id: number;
  background_name: string; // ⬅️ confirmá que esta línea esté presente
  background_category: PatientBackgroundCategory;
  is_present: boolean;
  description: string;
}

export interface AddPatientBackgroundModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: NewPatientBackgroundPayload) => void | Promise<void>;
  /** Categoría inicial con la que abre el modal (ej. la pestaña activa al hacer click en "Agregar") */
  initialCategory?: PatientBackgroundCategory;
}

export default function AddPatientBackgroundModal({
  open,
  onClose,
  onSave,
  initialCategory = "general",
}: AddPatientBackgroundModalProps) {
  const { fetchBackgroundCatalog } = useCatalog();

  const [category, setCategory] =
    useState<PatientBackgroundCategory>(initialCategory);
  const [backgroundCatalog, setBackgroundCatalog] = useState<
    CatalogBackgroundItem[]
  >([]);
  const [backgroundCatalogId, setBackgroundCatalogId] = useState<string>("");
  const [isPresent, setIsPresent] = useState<boolean>(true);
  const [description, setDescription] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga el catálogo de antecedentes UNA sola vez al montar (createCachedFetcher
  // ya evita el refetch entre aperturas del modal — mismo patrón que companionTypes)
  useEffect(() => {
    const loadCatalog = async () => {
      const data = await fetchBackgroundCatalog();
      setBackgroundCatalog(data ?? []);
    };
    loadCatalog();
  }, [fetchBackgroundCatalog]);

  // Reinicia el formulario cada vez que el modal se abre
  useEffect(() => {
    if (!open) return;
    setCategory(initialCategory);
    setBackgroundCatalogId("");
    setIsPresent(true);
    setDescription("");
    setError(null);
  }, [open, initialCategory]);

  // Al cambiar de categoría, limpia la selección previa (ya no aplica a la nueva lista)
  useEffect(() => {
    setBackgroundCatalogId("");
  }, [category]);

  const backgroundCatalogOptions = useMemo(
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

  const selectedLabel = backgroundCatalogOptions.find(
    (opt) => opt.value === backgroundCatalogId,
  )?.label;

  const isSaveDisabled = saving || !backgroundCatalogId;

  const handleSave = useCallback(async () => {
    if (!backgroundCatalogId || !selectedLabel) return;
    try {
      setSaving(true);
      setError(null);
      await onSave({
        background_catalog_id: Number(backgroundCatalogId),
        background_name: selectedLabel, // ⬅️ confirmá que esta línea esté presente
        background_category: category,
        is_present: isPresent,
        description,
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el antecedente",
      );
    } finally {
      setSaving(false);
    }
  }, [
    backgroundCatalogId,
    selectedLabel,
    category,
    isPresent,
    description,
    onSave,
    onClose,
  ]);

  return (
    <HceFormModal
      open={open}
      onClose={onClose}
      title="Agregar antecedentes"
      maxWidth="md"
      buttonAlign="right"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          textAlign: "start",
          mt: 1,
        }}
      >
        <SegmentedToggle
          options={[
            { label: "Generales", value: "general" },
            { label: "Gineco - obstétricos", value: "gyn_obstetric" },
            { label: "Patológicos", value: "pathological" },
          ]}
          value={category}
          onChange={(v) => setCategory(v as PatientBackgroundCategory)}
        />

        <SelectField
          label="Registro de Antecedentes"
          placeholder="-Seleccionar opción-"
          value={backgroundCatalogId}
          onChange={(v) => setBackgroundCatalogId(v)}
          options={backgroundCatalogOptions}
        />

        {backgroundCatalogId && (
          <Box
            sx={{
              border: "1px solid var(--ds-color-success, #8bc34a)",
              borderRadius: "8px",
              p: 2,
            }}
          >
            <Box sx={{ fontWeight: 600, mb: 2 }}>{selectedLabel}</Box>
            <Grid container spacing={2} alignItems="flex-end" wrap="nowrap">
              <Grid item xs={12} sm={3} md={3} zeroMinWidth>
                <Checkbox
                  label="SI"
                  checked={isPresent}
                  onChange={(v) => setIsPresent(v)}
                />
              </Grid>
              <Grid item xs={12} sm={9} md={9} zeroMinWidth>
                <TextInput
                  placeholder="Ingresa texto"
                  value={description}
                  onChange={(v) => setDescription(v)}
                />
              </Grid>
            </Grid>
          </Box>
        )}

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

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color={"var(--ds-color-interactive-button)"}
            onClick={handleSave}
            disabled={isSaveDisabled}
            aria-label="Guardar"
          >
            Guardar
          </Button>
        </Box>
      </Box>
    </HceFormModal>
  );
}
