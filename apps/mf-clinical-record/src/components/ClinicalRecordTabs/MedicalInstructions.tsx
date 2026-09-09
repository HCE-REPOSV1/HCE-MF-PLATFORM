import {
  Box,
  Button,
  Checkbox,
  GenericTable,
  Grid,
  hceColors,
  NumericField,
  SearchComboInput,
  SelectField,
  TextInput,
  UiDeleteIcon,
  type GenericTableColumn,
  type SearchOption,
} from "@hce/design-system";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCatalog } from "../../hooks/useCatalog";
import type {
  CatalogAdministrationRoute,
  CatalogMedicationProduct,
} from "../../types/Catalog.type";
import { i18n } from "@hce/i18n-core";


type MedicationSearchMode = "name" | "dci";

export interface MedicalInstructionForm {
  type: string | null;
  medicationSearchMode: MedicationSearchMode;
  medicationQuery: string;
  medicationSelected: SearchOption | null;
  medicine: string[];
  diagnostico: string;
  dosis: string;
  frecuencia: string;
  velocidad: string;
  via: string;
  stat: boolean;
  indicaciones: string;
}

const EMPTY_FORM: MedicalInstructionForm = {
  type: "",
  medicationSearchMode: "name",
  medicationQuery: "",
  medicationSelected: null,
  medicine: [],
  diagnostico: "",
  dosis: "",
  frecuencia: "",
  velocidad: "",
  via: "",
  stat: false,
  indicaciones: "",
};



const SEARCH_MODES = [
  { value: "name", label: "Por nombre" },
  { value: "dci", label: "DCI" },
];

const data: MedicalInstructionForm[] = [
  {
    type: "Oral",
    medicationSearchMode: "name",
    medicationQuery: "Paracetamol",
    medicationSelected: null,
    medicine: ["12345"],
    diagnostico: "Dolor de cabeza",
    dosis: "500mg",
    frecuencia: "Cada 8 horas",
    velocidad: "",
    via: "Oral",
    stat: false,
    indicaciones: "Tomar con agua",
  },
]


const createInfoColumns = ({
  canDelete,
  onDelete,
  labels,
}: {
  canDelete: boolean;
  onDelete: (row: MedicalInstructionForm) => void;
  labels: {
    type: string;
    diagnostic: string;
    medicine: string;
    dosis:string
    frecuency: string;
    via:string;
    delete:string;


  };
}): GenericTableColumn<MedicalInstructionForm>[] => [
  {
  key: "API",
  header: labels.type,
  type: "text",
  field: "type",
  width: 100,
  align: "left",
},
  {
    key: "food",
    header: labels.diagnostic,
    type: "text",
    field: "diagnostico",
    width: 100,
    align: "center",
  },
  {
    key: "other",
    header: labels.dosis,
    type: "text",
    field: "dosis",
    width: 100,
    align: "center",
  },

   {
    key: "other",
    header: labels.frecuency,
    type: "text",
    field: "frecuencia",
    width: 100,
    align: "center",
  },

   {
    key: "other",
    header: labels.via,
    type: "text",
    field: "via",
    width: 100,
    align: "center",
  },

   {
    key: "other",
    header: "Ind.",
    type: "text",
    field: "indicaciones",
    width: 100,
    align: "center",
  },

  {
    key: "on_edit",
    header: labels.delete,
    type: "icon",
    field: "delete",
    icon: UiDeleteIcon,
    iconSize: 18,
    width: 50,
    align: "center",
    clickable: true,
    disabledGetter: () => !canDelete,
    colorGetter: () => (canDelete ? hceColors.alert.error[600] : "#A0A0A0"),
    onClick: (row) => {
      onDelete(row);
    },
  },
];


export const MedicalInstructions = () => {
  const { fetchMedicationProductsSearch, fetchAdministrationRoutes } = useCatalog();
  const [form, setForm] = useState<MedicalInstructionForm>(EMPTY_FORM);
  const [medicationOptions, setMedicationOptions] = useState<SearchOption[]>([]);
  const [medicationResults, setMedicationResults] = useState<
    CatalogMedicationProduct[]
  >([]);
  const [administrationRoutes, setAdministrationRoutes] = useState<
    CatalogAdministrationRoute[]
  >([]);

  const [typeOptions, setTypeOptions] = useState< { value: string; label: string }[]>([]);
  const [loadingMedication, setLoadingMedication] = useState(false);
  const latestSearchRef = useRef(0);
  const { fetchCodeSystemValuesByCode } =
    useCatalog();

  const set = useCallback(
    <K extends keyof MedicalInstructionForm>(
      key: K,
      value: MedicalInstructionForm[K],
    ) => {
      setForm((current) => ({ ...current, [key]: value }));
    },
    [],
  );

useEffect(() => {
    
    const load = async () => {
      const result = await Promise.all([
        fetchCodeSystemValuesByCode("MEDICAL_INDICATION_TYPE"),
       
      ]);
      const [
        typeData,
      ] = result;

      if (typeData) {
      
        setTypeOptions(
          (typeData ?? [])
            .filter((item) => item.is_active)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((item) => ({
              value: item.value_uuid,
              label: item.display,
            })),
        );
      }
    };
    load();
  }, [ i18n.language]);

  useEffect(() => {
    const loadRoutes = async () => {
      const data = await fetchAdministrationRoutes();
      setAdministrationRoutes(data ?? []);
    };
    loadRoutes();
  }, [fetchAdministrationRoutes, i18n.language]);

  const routeOptions = administrationRoutes
    .filter((item) => item.is_active)
    .map((item) => ({
      value: String(item.administration_route_id),
      label: item.description,
    }));
        



  const clearMedicationSearch = useCallback(() => {
    latestSearchRef.current += 1;
    setMedicationOptions([]);
    setMedicationResults([]);
  }, []);

  const handleMedicationSearch = useCallback(
    async (query: string) => {
      const searchId = ++latestSearchRef.current;
      setLoadingMedication(true);

      try {
        // product_display_search contiene nombre y DCI/sinónimos.
        const results = (await fetchMedicationProductsSearch(query)) ?? [];
        if (searchId !== latestSearchRef.current) return;

        setMedicationResults(results);
        setMedicationOptions(
          results.map((medication, index) => ({
            value: index,
            label: medication.product_display,
            secondary: medication.medication_legacy_code,
          })),
        );
      } finally {
        if (searchId === latestSearchRef.current) {
          setLoadingMedication(false);
        }
      }
    },
    [fetchMedicationProductsSearch],
  );

  const handleMedicationSelect = useCallback(
    (option: SearchOption) => {
      const medication = medicationResults[option.value];
      if (!medication) return;

      set("medicationSelected", option);
      set("medicationQuery", option.label);
      set("medicine", [medication.medication_legacy_code]);
      clearMedicationSearch();
    },
    [clearMedicationSearch, medicationResults, set],
  );

  const handleDelete = useCallback((row: MedicalInstructionForm) => {
    console.log("Delete row:", row);
  }, []);


   const columns = useMemo(
      () =>
        createInfoColumns({
          canDelete: true,
          onDelete: handleDelete,
          labels: {
            type: "Tipo",
            diagnostic: "Diagnóstico",
            medicine: "Medicamento",
            dosis: "Dosis",
            frecuency: "Frecuencia",
            via: "Vía",
            delete: "Eliminar",
          },
        }),
      [handleDelete],
    );
         

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      <label style={{ fontSize: "16px", fontWeight: 600, color: "var(--ds-color-primary-dark, #000000)", marginTop: "12px" }}>
        Registrar tratamiento 
      </label>
      <Grid container columns={12} spacing={1} columnSpacing={1} alignItems="flex-end" justifyContent="space-between" wrap="wrap">
        <Grid item xs={12} sm={3} zeroMinWidth>
          <SelectField
            label="Tipo"
            value={form.type ?? ""}
            options={typeOptions}
            onChange={(value) => {
              set("type", value);
              if (value === "0") {
                set("medicine", []);
                set("diagnostico", "");
                set("dosis", "");
              }
            }}
            testId="mf-clinical-record-medical-instruction-type"
          />
        </Grid>
        <Grid item xs={12} sm={8.7} zeroMinWidth>
          <SearchComboInput
            modes={SEARCH_MODES}
            label="Medicamento"
            searchMode={form.medicationSearchMode}
            onSearchModeChange={(mode) => {
              set("medicationSearchMode", mode as MedicationSearchMode);
              set("medicationQuery", "");
              set("medicationSelected", null);
              set("medicine", []);
              clearMedicationSearch();
            }}
            value={form.medicationQuery}
            onChange={(value) => {
              set("medicationQuery", value);
              set("medicationSelected", null);
              set("medicine", []);
              if (value.length < 2) clearMedicationSearch();
            }}
            onSearch={handleMedicationSearch}
            onSelect={handleMedicationSelect}
            options={medicationOptions}
            loading={loadingMedication}
            placeholder="Ingrese nombre o DCI"
            debounceMs={300}
            testId="mf-clinical-record-medication-search"
          />
        </Grid>
      </Grid>

      <Grid container columns={12} spacing={1} alignItems="flex-end" wrap="wrap" justifyContent="space-between">
        <Grid item xs={12} sm={3.5} zeroMinWidth>
          <SelectField
            label="Diagnóstico"
            value={form.diagnostico}
            options={[]}
            onChange={(value) => set("diagnostico", value)}
          />
        </Grid>
        <Grid item xs={12} sm={1} zeroMinWidth>
          <NumericField label="Dosis" value={form.dosis} onChange={(value) => set("dosis", value)} suffix="ej. 1" />
        </Grid>
        <Grid item xs={12} sm={1} zeroMinWidth>
          <NumericField label="Cada (Horas)" value={form.frecuencia} onChange={(value) => set("frecuencia", value)} suffix="- hrs" />
        </Grid>
        <Grid item xs={12} sm={1} zeroMinWidth>
          <NumericField label="Velocidad*" value={form.velocidad} onChange={(value) => set("velocidad", value)} suffix="ej: 50 cc/h" disabled />
        </Grid>
        <Grid item xs={12} sm={2.5} zeroMinWidth>
          <SelectField label="Vía" value={form.via} onChange={(value) => set("via", value)} options={routeOptions} />
        </Grid>
        <Grid item xs={12} sm={1} zeroMinWidth >
          <Box style={{ border: "1px solid var(--ds-color-secondary, #d9d9d9)", borderRadius: "8px", padding: "8px" }}>
          <Checkbox label="STAT" checked={form.stat} onChange={(value) => set("stat", value)}   />
            </Box>
        </Grid>
      </Grid>

      <Grid container columns={12} spacing={2} alignItems="flex-end" justifyContent="flex-end" wrap="wrap">
        <Grid item xs={12} sm={12} zeroMinWidth>
          <TextInput
            label="Indicación"
            value={form.indicaciones}
            onChange={(value) => set("indicaciones", value)}
            placeholder="Agregar texto"
          />
        </Grid>
        <Grid item xs={12} sm={2}  zeroMinWidth>
          <Button variant="outlined" color="var(--ds-color-secondary)" style={{ paddingBottom: "10px", paddingTop: "10px" }} fullWidth onClick={() => undefined}>
            Agregar
          </Button>
        </Grid>
      </Grid>

      <Box>

        <GenericTable
        rows={data}
        columns={columns}  
         getRowId={(row) => String(row.type)}
                maxHeight="100%"
       />
      </Box>
    </Box>
  );
};
