import { useEffect, useMemo, useState } from "react";
import {
  AddCircleIcon,
  Box,
  Button,
  GenericTable,
  Grid,
  RadioGroup,
  SectionHeader,
  SegmentedToggle,
  SelectField,
  TextInput,
  TextareaField,
  UiTrashIcon,
  hceColors,
  type GenericTableColumn,
} from "@hce/design-system";
import "./HistoryPhysicalExam.css";
import {
  EditModeProvider,
  useFieldEditMode,
} from "../../context/EditModeContext";
import { PERMISSIONS_CLINICAL_RECORD } from "../../config/permissions";
import type {
  AnamnesisPayload,
  MedicationReconciliationApiItem,
  MedicationReconciliationRow,
  PatientBackgroundApiItem,
  PatientBackgroundRow,
  PhysicalExamApiItem,
  PhysicalExamPayload,
} from "../../types/MedicalHistory";
import { useClinicalRecordForm } from "../../context/ClinicalRecordFormContext";
import { useUser } from "shell/UserContext";
import { useCatalog } from "../../hooks/useCatalog";
import { useMedicalHistory } from "../../hooks/useMedicalHistory";
import AddPatientBackgroundModal from "./AddPatientBackgroundModal";
import AddMedicationReconciliationModal from "./AddMedicationReconciliationModal";

type ViewMode = "anamnesis" | "examen-fisico";
type PatientBackgroundCategory = "general" | "gyn_obstetric" | "pathological";

// ⚠️ hardcodeado temporalmente — reemplazar cuando se resuelva la captura
// del encounter_id real desde la fila clickeada en MedicalHistoryModal
const ENCOUNTER_ID_FIJO = 104;

const RECONCILIATION_ACTION_LABELS: Record<string, string> = {
  continue: "Continúa",
  suspend: "Suspende", // ⚠️ nombre de valor asumido — confirmar con backend
  modify: "Modifica", // ⚠️ asumido
};

const BIOLOGICAL_FUNCTION_OPTIONS = [
  { value: "unaltered", label: "Sin alteración" },
  { value: "decreased", label: "Disminuido" },
  { value: "normal", label: "Normal" },
  // ⚠️ lista incompleta — faltan confirmar el resto de valores del catálogo
];

interface HistoryPhysicalExamProps {
  readOnly?: boolean;
}

export const HistoryPhysicalExam = ({
  readOnly = false,
}: HistoryPhysicalExamProps) => {
  return (
    <EditModeProvider
      tabWriteCode={PERMISSIONS_CLINICAL_RECORD.historyPhysicalExam.write}
    >
      <HistoryPhysicalExamContent readOnly={readOnly} />
    </EditModeProvider>
  );
};

export const HistoryPhysicalExamContent = ({
  readOnly = false,
}: HistoryPhysicalExamProps) => {
  const [view, setView] = useState<ViewMode>("anamnesis");

  return (
    <div className="hce-history-physical-exam">
      <SegmentedToggle
        options={[
          { label: "Anamnesis", value: "anamnesis" },
          { label: "Examen Físico", value: "examen-fisico" },
        ]}
        value={view}
        onChange={(v) => setView(v as ViewMode)}
      />

      {view === "anamnesis" && <AnamnesisContent readOnly={readOnly} />}
      {view === "examen-fisico" && <ExamenFisicoContent readOnly={readOnly} />}
    </div>
  );
};

const AnamnesisContent = ({ readOnly }: { readOnly: boolean }) => {
  const { fetchCompanionTypes } = useCatalog();
  const { fetchHistoryPhysicalExam } = useMedicalHistory();
  const { user } = useUser();
  const { registerTabData, getTabData } = useClinicalRecordForm();
  const [expanded, setExpanded] = useState({
    motivo: true,
    antecedentes: false,
    reconciliacion: false,
  });
  const toggle = (key: keyof typeof expanded) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const canEditMotivoRaw = useFieldEditMode(
    PERMISSIONS_CLINICAL_RECORD.historyPhysicalExam.campos.motivoConsulta,
  );
  // En modo lectura, ningún campo es editable sin importar el permiso MAC
  const canEditMotivo = readOnly ? false : canEditMotivoRaw;

  // Lee lo que ya se hubiera guardado en el context ANTES de inicializar el estado
  const savedAnamnesis = getTabData("historyPhysicalExam.anamnesis") as
    | AnamnesisPayload
    | undefined;
  const savedPatientBackgrounds = getTabData(
    "historyPhysicalExam.patientBackgrounds",
  ) as PatientBackgroundApiItem[] | undefined;
  const savedMedicationReconciliations = getTabData(
    "historyPhysicalExam.medicationReconciliations",
  ) as MedicationReconciliationApiItem[] | undefined;

  const [anamnesisType, setAnamnesisType] = useState<
    "direct" | "indirect" | null
  >(savedAnamnesis?.anamnesis_type ?? "direct");
  const [companionTypeId, setCompanionTypeId] = useState<string>(
    savedAnamnesis?.companion_type_id != null
      ? String(savedAnamnesis.companion_type_id)
      : "",
  );
  const [chiefComplaintId, setChiefComplaintId] = useState<string>(
    savedAnamnesis?.chief_complaint ?? "",
  );
  const [patientBackgrounds, setPatientBackgrounds] = useState<
    PatientBackgroundApiItem[]
  >(savedPatientBackgrounds ?? []);

  const optionCompanionRadio = [
    { value: "direct", label: "Directo" },
    { value: "indirect", label: "Indirecto" },
  ];

  const [companionTypeOptions, setCompanionTypeOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [medicationReconciliations, setMedicationReconciliations] = useState<
    MedicationReconciliationApiItem[]
  >(savedMedicationReconciliations ?? []);

  // Efecto 1: carga el catálogo de acompañantes UNA sola vez al montar
  useEffect(() => {
    const loadCatalog = async () => {
      const companionTypes = await fetchCompanionTypes();
      setCompanionTypeOptions(
        (companionTypes ?? []).map((item) => ({
          value: String(item.companion_type_id),
          label: item.description,
        })),
      );
    };
    loadCatalog();
  }, [fetchCompanionTypes]);

  // Efecto 2: solo trae del backend si NUNCA se cargó en esta sesión del modal.
  // Si ya había datos en el context (savedAnamnesis), el usuario ya vio/editó
  // este tab antes — no lo pisamos con el fetch.
  useEffect(() => {
    if (savedAnamnesis) return; // ya se cargó/editó antes en esta sesión

    const loadHistoryData = async () => {
      const data = await fetchHistoryPhysicalExam(ENCOUNTER_ID_FIJO);
      if (!data) return;

      setAnamnesisType(data.anamnesis.anamnesis_type);
      setCompanionTypeId(
        data.anamnesis.companion_type_id !== null
          ? String(data.anamnesis.companion_type_id)
          : "",
      );
      setChiefComplaintId(data.anamnesis.chief_complaint);
      setPatientBackgrounds(data.patientBackgrounds);
      registerTabData(
        "historyPhysicalExam.patientBackgrounds",
        data.patientBackgrounds,
      );

      setMedicationReconciliations(data.medicationReconciliations);
      registerTabData(
        "historyPhysicalExam.medicationReconciliations",
        data.medicationReconciliations,
      );
    };
    loadHistoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // corre una sola vez al montar — el guard de arriba evita pisar ediciones

  // Efecto 3: registra los datos del tab para el guardado (solo si NO es readOnly)
  useEffect(() => {
    if (readOnly) return;
    if (!user?.username) return;

    registerTabData("historyPhysicalExam.anamnesis", {
      anamnesis_type: anamnesisType,
      companion_type_id: companionTypeId ? Number(companionTypeId) : null,
      chief_complaint: chiefComplaintId,
      user_create: user.username,
    } satisfies AnamnesisPayload);
  }, [
    readOnly,
    anamnesisType,
    companionTypeId,
    chiefComplaintId,
    user,
    registerTabData,
  ]);

  useEffect(() => {
    if (readOnly) return;
    if (anamnesisType === "direct") {
      setCompanionTypeId("");
    }
  }, [readOnly, anamnesisType]);

  return (
    <>
      <div className="hce-section">
        <SectionHeader
          title="Motivo de consulta"
          expanded={expanded.motivo}
          onToggle={() => toggle("motivo")}
        />
        {expanded.motivo && (
          <div className="hce-section__body">
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs="auto">
                <Box sx={{ mt: "22px" }}>
                  <RadioGroup
                    value={anamnesisType}
                    onChange={(v) =>
                      setAnamnesisType(v as "direct" | "indirect")
                    }
                    options={optionCompanionRadio}
                    disabled={!canEditMotivo}
                  />
                </Box>
              </Grid>
              <Grid item xs>
                <SelectField
                  label="Acompañante"
                  placeholder="-Seleccionar opción-"
                  value={companionTypeId}
                  onChange={(v) => setCompanionTypeId(v)}
                  options={companionTypeOptions}
                  disabled={!canEditMotivo || anamnesisType === "direct"}
                />
              </Grid>
            </Grid>

            <TextareaField
              label="Motivo"
              placeholder="Ingrese texto"
              value={chiefComplaintId}
              onChange={(v) => setChiefComplaintId(v)}
              maxLength={1000}
              disabled={!canEditMotivo}
            />
          </div>
        )}
      </div>

      <div className="hce-section">
        <SectionHeader
          title="Antecedentes"
          expanded={expanded.antecedentes}
          onToggle={() => toggle("antecedentes")}
        />
        {expanded.antecedentes && (
          <div className="hce-section__body">
            <PatientBackgroundsContent
              backgrounds={patientBackgrounds}
              readOnly={readOnly}
            />
          </div>
        )}
      </div>

      <div className="hce-section">
        <SectionHeader
          title="Reconciliación medicamentosa"
          expanded={expanded.reconciliacion}
          onToggle={() => toggle("reconciliacion")}
        />
        {expanded.reconciliacion && (
          <div className="hce-section__body">
            <ReconciliationContent
              reconciliations={medicationReconciliations}
              readOnly={readOnly}
            />
          </div>
        )}
      </div>
    </>
  );
};

const PatientBackgroundsContent = ({
  backgrounds,
  readOnly,
}: {
  backgrounds: PatientBackgroundApiItem[];
  readOnly: boolean;
}) => {
  const { user } = useUser();
  const { registerTabData, getTabData } = useClinicalRecordForm();
  const [category, setCategory] =
    useState<PatientBackgroundCategory>("general");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [addedBackgrounds, setAddedBackgrounds] = useState<
    PatientBackgroundApiItem[]
  >(
    () =>
      (getTabData("historyPhysicalExam.addedPatientBackgrounds") as
        | PatientBackgroundApiItem[]
        | undefined) ?? [],
  );

  useEffect(() => {
    registerTabData(
      "historyPhysicalExam.addedPatientBackgrounds",
      addedBackgrounds,
    );
  }, [addedBackgrounds, registerTabData]);

  const allBackgrounds = useMemo(
    () => [...backgrounds, ...addedBackgrounds],
    [backgrounds, addedBackgrounds],
  );

  const filteredRows = useMemo<PatientBackgroundRow[]>(
    () =>
      allBackgrounds
        .filter((item) => item.background_category === category)
        .map((item) => ({
          id: String(item.patient_background_id),
          date: "05/04/2024",
          backgroundType: item.background_name,
          description: item.description,
        })),
    [allBackgrounds, category],
  );

  const columnsTable = useMemo<GenericTableColumn<PatientBackgroundRow>[]>(
    () => [
      {
        key: "date",
        header: "Fecha",
        type: "text",
        field: "date",
        width: 100,
        align: "center",
        clickable: false,
      },
      {
        key: "backgroundType",
        header: "Antecedente",
        type: "text",
        field: "backgroundType",
        width: 100,
        align: "center",
        clickable: false,
      },
      {
        key: "description",
        header: "Descripción",
        type: "text",
        field: "description",
        width: 300,
        align: "center",
        clickable: false,
      },
    ],
    [],
  );

  return (
    <div className="hce-patient-backgrounds">
      {!readOnly && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            startIcon={<AddCircleIcon />}
            color={hceColors.primary.green[600]}
            onClick={() => setIsAddModalOpen(true)}
          >
            Agregar
          </Button>
        </Box>
      )}

      <AddPatientBackgroundModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialCategory={category}
        onSave={(payload) => {
          setAddedBackgrounds((prev) => [
            ...prev,
            {
              patient_background_id: -Date.now(),
              background_catalog_id: payload.background_catalog_id,
              background_name: payload.background_name,
              background_category: payload.background_category,
              is_present: payload.is_present,
              description: payload.description,
              user_create: user?.username ?? "",
            },
          ]);
        }}
      />

      <SegmentedToggle
        options={[
          { label: "Generales", value: "general" },
          { label: "Gineco - obstétricos", value: "gyn_obstetric" },
          { label: "Patológicos", value: "pathological" },
        ]}
        value={category}
        onChange={(v) => setCategory(v as PatientBackgroundCategory)}
      />

      <Box sx={{ pt: 2 }}>
        <GenericTable
          columns={columnsTable}
          rows={filteredRows}
          getRowId={(row) => row.id}
        />
      </Box>
    </div>
  );
};

const ReconciliationContent = ({
  reconciliations,
  readOnly,
}: {
  reconciliations: MedicationReconciliationApiItem[];
  readOnly: boolean;
}) => {
  const { user } = useUser();
  const { registerTabData, getTabData } = useClinicalRecordForm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [addedReconciliations, setAddedReconciliations] = useState<
    MedicationReconciliationApiItem[]
  >(
    () =>
      (getTabData("historyPhysicalExam.addedMedicationReconciliations") as
        | MedicationReconciliationApiItem[]
        | undefined) ?? [],
  );

  useEffect(() => {
    registerTabData(
      "historyPhysicalExam.addedMedicationReconciliations",
      addedReconciliations,
    );
  }, [addedReconciliations, registerTabData]);

  const allReconciliations = useMemo(
    () => [...reconciliations, ...addedReconciliations],
    [reconciliations, addedReconciliations],
  );

  const rows = useMemo<MedicationReconciliationRow[]>(
    () =>
      allReconciliations.map((item) => ({
        id: String(item.medication_reconciliation_id),
        medication: item.medication_display,
        doseValue: item.dose_value,
        route: item.administration_route_description,
        frequencyValue: item.frequency_value,
        action:
          RECONCILIATION_ACTION_LABELS[item.reconciliation_action] ??
          item.reconciliation_action,
        dateTime: "24/03/2026 - 13:50", // ⚠️ hardcodeado — el JSON de lectura no trae fecha, ver nota
      })),
    [allReconciliations],
  );

  const handleDelete = (row: MedicationReconciliationRow) => {
    setAddedReconciliations((prev) =>
      prev.filter(
        (item) => String(item.medication_reconciliation_id) !== row.id,
      ),
    );
    // ⚠️ los que vienen del backend (no agregados en sesión) no se pueden borrar
    // con este mecanismo — ver nota abajo
  };

  const columnsTable = useMemo<
    GenericTableColumn<MedicationReconciliationRow>[]
  >(
    () => [
      {
        key: "medication",
        header: "Medicamento",
        type: "text",
        field: "medication",
        width: 200,
        align: "left",
        clickable: false,
      },
      {
        key: "doseValue",
        header: "Dosis",
        type: "text",
        field: "doseValue",
        width: 60,
        align: "center",
        clickable: false,
      },
      {
        key: "route",
        header: "Via",
        type: "text",
        field: "route",
        width: 80,
        align: "center",
        clickable: false,
      },
      {
        key: "frequencyValue",
        header: "Frecuencia",
        type: "text",
        field: "frequencyValue",
        width: 80,
        align: "center",
        clickable: false,
      },
      {
        key: "action",
        header: "Acción",
        type: "text",
        field: "action",
        width: 100,
        align: "center",
        clickable: false,
      },
      {
        key: "dateTime",
        header: "Fecha y hora",
        type: "text",
        field: "dateTime",
        width: 140,
        align: "center",
        clickable: false,
      },
      {
        key: "delete",
        header: "Eliminar",
        type: "icon",
        field: "delete",
        icon: UiTrashIcon,
        iconSize: 18,
        width: 60,
        align: "center",
        clickable: true,
        disabledGetter: () => readOnly,
        colorGetter: () => (readOnly ? "#A0A0A0" : hceColors.alert.error[600]),
        onClick: handleDelete,
      },
    ],
    [readOnly],
  );

  return (
    <div className="hce-medication-reconciliation">
      {!readOnly && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            startIcon={<AddCircleIcon />}
            color={hceColors.primary.green[600]}
            onClick={() => setIsAddModalOpen(true)}
          >
            Agregar
          </Button>
        </Box>
      )}

      <AddMedicationReconciliationModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(payload) => {
          setAddedReconciliations((prev) => [
            ...prev,
            {
              medication_reconciliation_id: -Date.now(),
              medication_product_id: payload.medication_product_id,
              medication_display: payload.medication_display,
              administration_route_id: payload.administration_route_id,
              administration_route_description:
                payload.administration_route_description,
              dose_value: payload.dose_value,
              frequency_value: payload.frequency_value,
              reconciliation_action: payload.reconciliation_action,
              last_dose_datetime: payload.last_dose_datetime, // ⚠️ nuevo — antes se perdía
              user_create: user?.username ?? "",
            },
          ]);
        }}
      />

      <GenericTable
        columns={columnsTable}
        rows={rows}
        getRowId={(row) => row.id}
      />
    </div>
  );
};

const ExamenFisicoContent = ({ readOnly }: { readOnly: boolean }) => {
  const { user } = useUser();
  const { fetchHistoryPhysicalExam } = useMedicalHistory();
  const { registerTabData, getTabData } = useClinicalRecordForm();

  const savedVitals = getTabData(
    "historyPhysicalExam.physicalExamVitals",
  ) as PhysicalExamApiItem | undefined;
  const savedForm = getTabData("historyPhysicalExam.physicalExam") as
    | PhysicalExamPayload
    | undefined;

  const [vitals, setVitals] = useState<PhysicalExamApiItem | null>(
    savedVitals ?? null,
  );
  const [examDescription, setExamDescription] = useState(
    savedForm?.exam_description ?? "",
  );
  const [sleepFunction, setSleepFunction] = useState(
    savedForm?.sleep_function ?? "",
  );
  const [appetiteFunction, setAppetiteFunction] = useState(
    savedForm?.appetite_function ?? "",
  );
  const [urineFunction, setUrineFunction] = useState(
    savedForm?.urine_function ?? "",
  );
  const [stoolFunction, setStoolFunction] = useState(
    savedForm?.stool_function ?? "",
  );
  const [weightFunction, setWeightFunction] = useState(
    savedForm?.weight_function ?? "",
  );

  // Trae los signos vitales del backend, solo una vez por sesión
  useEffect(() => {
    if (savedVitals) return;

    const load = async () => {
      const data = await fetchHistoryPhysicalExam(ENCOUNTER_ID_FIJO);
      if (!data) return;
      setVitals(data.physicalExam);
      registerTabData(
        "historyPhysicalExam.physicalExamVitals",
        data.physicalExam,
      );
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Registra el formulario editable (descripción + funciones biológicas)
  useEffect(() => {
    if (readOnly) return;
    if (!user?.username) return;

    registerTabData("historyPhysicalExam.physicalExam", {
      exam_description: examDescription,
      sleep_function: sleepFunction,
      appetite_function: appetiteFunction,
      urine_function: urineFunction,
      stool_function: stoolFunction,
      weight_function: weightFunction,
      user_create: user.username,
    } satisfies PhysicalExamPayload);
  }, [
    readOnly,
    examDescription,
    sleepFunction,
    appetiteFunction,
    urineFunction,
    stoolFunction,
    weightFunction,
    user,
    registerTabData,
  ]);

  return (
    <div className="hce-examen-fisico">
      <Box sx={{ fontWeight: 600, mb: 2 }}>Examen Físico</Box>

      <TextareaField
        label="Descripción"
        placeholder="Ingrese texto"
        value={examDescription}
        onChange={setExamDescription}
        maxLength={1000}
        disabled={readOnly}
      />

      <Box sx={{ fontWeight: 600, mt: 3, mb: 2 }}>Funciones Vitales</Box>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3} md={1.5} zeroMinWidth>
          <TextInput
            label="Saturación O2"
            value={vitals ? `${vitals.oxygen_saturation ?? "-"} % O2` : ""}
            onChange={() => {}}
            disabled
          />
        </Grid>
        <Grid item xs={6} sm={3} md={1.5} zeroMinWidth>
          <TextInput
            label="Peso"
            value={vitals ? `${vitals.weight_kg ?? "-"} kg` : ""}
            onChange={() => {}}
            disabled
          />
        </Grid>
        <Grid item xs={6} sm={3} md={1.5} zeroMinWidth>
          <TextInput
            label="Talla"
            value={vitals ? `${vitals.height_cm ?? "-"} cm` : ""}
            onChange={() => {}}
            disabled
          />
        </Grid>
        <Grid item xs={6} sm={3} md={1.5} zeroMinWidth>
          <TextInput
            label="F. Cardiaca"
            value={vitals ? `${vitals.heart_rate ?? "-"} lpm` : ""}
            onChange={() => {}}
            disabled
          />
        </Grid>
        <Grid item xs={6} sm={3} md={1.5} zeroMinWidth>
          <TextInput
            label="F.Respiratoria"
            value={vitals ? `${vitals.respiratory_rate ?? "-"} rpm` : ""}
            onChange={() => {}}
            disabled
          />
        </Grid>
        <Grid item xs={6} sm={3} md={1.5} zeroMinWidth>
          <TextInput
            label="P. Sistólica"
            value={vitals ? `${vitals.systolic_pressure ?? "-"} mmHg` : ""}
            onChange={() => {}}
            disabled
          />
        </Grid>
        <Grid item xs={6} sm={3} md={1.5} zeroMinWidth>
          <TextInput
            label="P. Diastólica"
            value={vitals ? `${vitals.diastolic_pressure ?? "-"} mmHg` : ""}
            onChange={() => {}}
            disabled
          />
        </Grid>
        <Grid item xs={6} sm={3} md={1.5} zeroMinWidth>
          <TextInput
            label="Temperatura"
            value={vitals ? `${vitals.temperature_c ?? "-"} °C` : ""}
            onChange={() => {}}
            disabled
          />
        </Grid>
      </Grid>

      <Box sx={{ fontWeight: 600, mt: 3, mb: 2 }}>Funciones biológicas</Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={2.4} zeroMinWidth>
          <SelectField
            label="Sueño"
            placeholder="-Seleccionar opción-"
            value={sleepFunction}
            onChange={setSleepFunction}
            options={BIOLOGICAL_FUNCTION_OPTIONS}
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4} zeroMinWidth>
          <SelectField
            label="Apetito"
            placeholder="-Seleccionar opción-"
            value={appetiteFunction}
            onChange={setAppetiteFunction}
            options={BIOLOGICAL_FUNCTION_OPTIONS}
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4} zeroMinWidth>
          <SelectField
            label="Orina"
            placeholder="-Seleccionar opción-"
            value={urineFunction}
            onChange={setUrineFunction}
            options={BIOLOGICAL_FUNCTION_OPTIONS}
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4} zeroMinWidth>
          <SelectField
            label="Deposición"
            placeholder="-Seleccionar opción-"
            value={stoolFunction}
            onChange={setStoolFunction}
            options={BIOLOGICAL_FUNCTION_OPTIONS}
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4} zeroMinWidth>
          <SelectField
            label="Peso"
            placeholder="-Seleccionar opción-"
            value={weightFunction}
            onChange={setWeightFunction}
            options={BIOLOGICAL_FUNCTION_OPTIONS}
            disabled={readOnly}
          />
        </Grid>
      </Grid>
    </div>
  );
};