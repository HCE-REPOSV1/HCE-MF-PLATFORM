import { useEffect, useMemo, useState } from "react";
import {
  AddCircleIcon,
  Box,
  Button,
  GenericTable,
  Grid,
  RadioGroup,
  SectionHeader,
  NumericField,
  SegmentedToggle,
  SelectField,
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

// const ENCOUNTER_ID_FIJO = 104;
const SLEEP_APPETITE_CODE_SYSTEM_ID = 25;
const URINE_STOOL_WEIGHT_CODE_SYSTEM_ID = 26;

const RECONCILIATION_ACTION_LABELS: Record<string, string> = {
  continue: "Continúa",
  suspend: "Suspende",
  modify: "Modifica",
};

interface HistoryPhysicalExamProps {
  readOnly?: boolean;
  encounterId?: number;
}

export const HistoryPhysicalExam = ({
  readOnly = false,
  encounterId,
}: HistoryPhysicalExamProps) => {
  return (
    <EditModeProvider
      tabWriteCode={PERMISSIONS_CLINICAL_RECORD.historyPhysicalExam.write}
    >
      <HistoryPhysicalExamContent
        readOnly={readOnly}
        encounterId={encounterId}
      />
    </EditModeProvider>
  );
};

export const HistoryPhysicalExamContent = ({
  readOnly = false,
  encounterId,
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

      {view === "anamnesis" && (
        <AnamnesisContent readOnly={readOnly} encounterId={encounterId} />
      )}
      {view === "examen-fisico" && (
        <ExamenFisicoContent readOnly={readOnly} encounterId={encounterId} />
      )}
    </div>
  );
};

const AnamnesisContent = ({
  readOnly,
  encounterId,
}: {
  readOnly: boolean;
  encounterId?: number;
}) => {
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
    if (encounterId === undefined) return;
    const validEncounterId = encounterId;
    const loadHistoryData = async () => {
      const data = await fetchHistoryPhysicalExam(validEncounterId);
      if (!data) return;

      // ⚠️ nuevo guard: la anamnesis puede venir null si aún no existe para
      // esta atención (ej. encounter_id 104 en tu prueba con Postman)
      if (data.anamnesis) {
        setAnamnesisType(data.anamnesis.anamnesis_type);
        setCompanionTypeId(
          data.anamnesis.companion_type_id !== null
            ? String(data.anamnesis.companion_type_id)
            : "",
        );
        setChiefComplaintId(data.anamnesis.chief_complaint);
      }

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
  }, [encounterId]); // corre una sola vez al montar — el guard de arriba evita pisar ediciones

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

const ExamenFisicoContent = ({
  readOnly,
  encounterId,
}: {
  readOnly: boolean;
  encounterId?: number;
}) => {
  const { user } = useUser();
  const { fetchHistoryPhysicalExam } = useMedicalHistory();
  const { fetchCodeSystemValues } = useCatalog(); // ⚠️ nuevo
  const { registerTabData, getTabData } = useClinicalRecordForm();

  const savedVitals = getTabData("historyPhysicalExam.physicalExamVitals") as
    | PhysicalExamApiItem
    | undefined;
  const savedForm = getTabData("historyPhysicalExam.physicalExam") as
    | PhysicalExamPayload
    | undefined;

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

  const [oxygenSaturation, setOxygenSaturation] = useState(
    savedVitals?.oxygen_saturation != null
      ? String(savedVitals.oxygen_saturation)
      : "",
  );
  const [weightKg, setWeightKg] = useState(
    savedVitals?.weight_kg != null ? String(savedVitals.weight_kg) : "",
  );
  const [heightCm, setHeightCm] = useState(
    savedVitals?.height_cm != null ? String(savedVitals.height_cm) : "",
  );
  const [heartRate, setHeartRate] = useState(
    savedVitals?.heart_rate != null ? String(savedVitals.heart_rate) : "",
  );
  const [respiratoryRate, setRespiratoryRate] = useState(
    savedVitals?.respiratory_rate != null
      ? String(savedVitals.respiratory_rate)
      : "",
  );
  const [systolicPressure, setSystolicPressure] = useState(
    savedVitals?.systolic_pressure != null
      ? String(savedVitals.systolic_pressure)
      : "",
  );
  const [diastolicPressure, setDiastolicPressure] = useState(
    savedVitals?.diastolic_pressure != null
      ? String(savedVitals.diastolic_pressure)
      : "",
  );
  const [temperatureC, setTemperatureC] = useState(
    savedVitals?.temperature_c != null ? String(savedVitals.temperature_c) : "",
  );

  const [sleepAppetiteOptions, setSleepAppetiteOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [urineStoolWeightOptions, setUrineStoolWeightOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Trae los signos vitales del backend, solo una vez por sesión
  useEffect(() => {
    if (savedVitals) return;
    if (encounterId === undefined) return;

    const validEncounterId = encounterId;

    const load = async () => {
      const data = await fetchHistoryPhysicalExam(validEncounterId);
      if (!data?.physicalExam) return;

      const v = data.physicalExam;
      setOxygenSaturation(
        v.oxygen_saturation != null ? String(v.oxygen_saturation) : "",
      );
      setWeightKg(v.weight_kg != null ? String(v.weight_kg) : "");
      setHeightCm(v.height_cm != null ? String(v.height_cm) : "");
      setHeartRate(v.heart_rate != null ? String(v.heart_rate) : "");
      setRespiratoryRate(
        v.respiratory_rate != null ? String(v.respiratory_rate) : "",
      );
      setSystolicPressure(
        v.systolic_pressure != null ? String(v.systolic_pressure) : "",
      );
      setDiastolicPressure(
        v.diastolic_pressure != null ? String(v.diastolic_pressure) : "",
      );
      setTemperatureC(v.temperature_c != null ? String(v.temperature_c) : "");

      registerTabData("historyPhysicalExam.physicalExamVitals", v);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounterId]);

  // Registra los signos vitales editables para el guardado (solo si NO es readOnly)
  useEffect(() => {
    if (readOnly) return;

    registerTabData("historyPhysicalExam.physicalExamVitals", {
      oxygen_saturation: oxygenSaturation ? Number(oxygenSaturation) : null,
      weight_kg: weightKg ? Number(weightKg) : null,
      height_cm: heightCm ? Number(heightCm) : null,
      heart_rate: heartRate ? Number(heartRate) : null,
      respiratory_rate: respiratoryRate ? Number(respiratoryRate) : null,
      systolic_pressure: systolicPressure ? Number(systolicPressure) : null,
      diastolic_pressure: diastolicPressure ? Number(diastolicPressure) : null,
      temperature_c: temperatureC ? Number(temperatureC) : null,
    });
  }, [
    readOnly,
    oxygenSaturation,
    weightKg,
    heightCm,
    heartRate,
    respiratoryRate,
    systolicPressure,
    diastolicPressure,
    temperatureC,
    registerTabData,
  ]);

  // carga el catálogo compartido de Sueño/Apetito, una sola vez
  useEffect(() => {
    const load = async () => {
      const data = await fetchCodeSystemValues(SLEEP_APPETITE_CODE_SYSTEM_ID);
      setSleepAppetiteOptions(
        (data ?? [])
          .filter((item) => item.is_active)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((item) => ({ value: item.code, label: item.display })),
      );
    };
    load();
  }, [fetchCodeSystemValues]);

  // carga el catálogo de Orina/Deposición/Peso, una sola vez
  useEffect(() => {
    const load = async () => {
      const data = await fetchCodeSystemValues(
        URINE_STOOL_WEIGHT_CODE_SYSTEM_ID,
      );
      setUrineStoolWeightOptions(
        (data ?? [])
          .filter((item) => item.is_active)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((item) => ({ value: item.code, label: item.display })),
      );
    };
    load();
  }, [fetchCodeSystemValues]);

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
          <NumericField
            label="Saturación O2 (%)"
            value={oxygenSaturation}
            onChange={setOxygenSaturation}
            suffix="%"
            numberType="natural"
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={1.5} zeroMinWidth>
          <NumericField
            label="Peso (kg)"
            value={weightKg}
            onChange={setWeightKg}
            suffix="Kg"
            numberType="decimal"
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={1.5} zeroMinWidth>
          <NumericField
            label="Talla (cm)"
            value={heightCm}
            onChange={setHeightCm}
            suffix="cm"
            numberType="natural"
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={1.5} zeroMinWidth>
          <NumericField
            label="F. Cardiaca (lpm)"
            value={heartRate}
            onChange={setHeartRate}
            suffix="lpm"
            numberType="natural"
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={1.5} zeroMinWidth>
          <NumericField
            label="F.Respiratoria (rpm)"
            value={respiratoryRate}
            onChange={setRespiratoryRate}
            suffix="rpm"
            numberType="natural"
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={1.5} zeroMinWidth>
          <NumericField
            label="P. Sistólica (mmHg)"
            value={systolicPressure}
            onChange={setSystolicPressure}
            suffix="mmHg"
            numberType="natural"
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={1.5} zeroMinWidth>
          <NumericField
            label="P. Diastólica (mmHg)"
            value={diastolicPressure}
            onChange={setDiastolicPressure}
            suffix="mmHg"
            numberType="natural"
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={1.5} zeroMinWidth>
          <NumericField
            label="Temperatura (°C)"
            value={temperatureC}
            onChange={setTemperatureC}
            suffix="°C"
            numberType="decimal"
            disabled={readOnly}
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
            options={sleepAppetiteOptions}
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4} zeroMinWidth>
          <SelectField
            label="Apetito"
            placeholder="-Seleccionar opción-"
            value={appetiteFunction}
            onChange={setAppetiteFunction}
            options={sleepAppetiteOptions}
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4} zeroMinWidth>
          <SelectField
            label="Orina"
            placeholder="-Seleccionar opción-"
            value={urineFunction}
            onChange={setUrineFunction}
            options={urineStoolWeightOptions}
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4} zeroMinWidth>
          <SelectField
            label="Deposición"
            placeholder="-Seleccionar opción-"
            value={stoolFunction}
            onChange={setStoolFunction}
            options={urineStoolWeightOptions}
            disabled={readOnly}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4} zeroMinWidth>
          <SelectField
            label="Peso"
            placeholder="-Seleccionar opción-"
            value={weightFunction}
            onChange={setWeightFunction}
            options={urineStoolWeightOptions}
            disabled={readOnly}
          />
        </Grid>
      </Grid>
    </div>
  );
};
