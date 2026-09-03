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
  LoadingOverlay,
} from "@hce/design-system";
import { useTranslation } from "react-i18next";
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
import { formatDate, formatDateTime } from "../../utils/dateFormat";
import { getLocalizedCatalogDisplay } from "../../utils/catalogLocalization";
import type { CatalogCompanionTypes } from "../../types/Catalog.type";

type ViewMode = "anamnesis" | "examen-fisico";
type PatientBackgroundCategory = "general" | "gyn_obstetric" | "pathological";

const SLEEP_APPETITE_CODE_SYSTEM_ID = 127;
const URINE_STOOL_WEIGHT_CODE_SYSTEM_ID = 128;

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
  const { t } = useTranslation("clinical-record");
  const [view, setView] = useState<ViewMode>("anamnesis");

  return (
    <div className="hce-history-physical-exam">
      <SegmentedToggle<ViewMode>
        options={[
          {
            label: t("historyPhysicalExam.viewToggle.anamnesis"),
            value: "anamnesis",
          },
          {
            label: t("historyPhysicalExam.viewToggle.physicalExam"),
            value: "examen-fisico",
          },
        ]}
        value={view}
        onChange={setView}
        testId="clinical-record-history-physical-exam-view-toggle"
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
  const { t, i18n } = useTranslation("clinical-record");
  const { fetchCompanionTypes } = useCatalog();
  const { fetchHistoryPhysicalExam } =
    useMedicalHistory();
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
  const canEditMotivo = readOnly ? false : canEditMotivoRaw;

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

  const optionCompanionRadio = useMemo(
    () => [
      { value: "direct", label: t("historyPhysicalExam.anamnesisType.direct") },
      {
        value: "indirect",
        label: t("historyPhysicalExam.anamnesisType.indirect"),
      },
    ],
    [t],
  );

  const [medicationReconciliations, setMedicationReconciliations] = useState<
    MedicationReconciliationApiItem[]
  >(savedMedicationReconciliations ?? []);

  const [companionTypes, setCompanionTypes] = useState<CatalogCompanionTypes[]>(
    [],
  );

  useEffect(() => {
    const loadCatalog = async () => {
      const data = await fetchCompanionTypes();
      setCompanionTypes(data ?? []);
    };
    loadCatalog();
  }, [fetchCompanionTypes]);

  const companionTypeOptions = useMemo(
    () =>
      companionTypes.map((item) => ({
        value: String(item.companion_type_id),
        label: getLocalizedCatalogDisplay(
          {
            display_es: item.description_es,
            display_en: item.description_en,
          },
          i18n.language,
          item.description,
        ),
      })),
    [companionTypes, i18n.language],
  );

  useEffect(() => {
    if (savedAnamnesis) return;
    if (encounterId === undefined) return;
    const validEncounterId = encounterId;
    const loadHistoryData = async () => {
      const data = await fetchHistoryPhysicalExam(validEncounterId);
      if (!data) return;

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
  }, [encounterId]);

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
          title={t("historyPhysicalExam.sections.chiefComplaint")}
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
                  label={t("historyPhysicalExam.companionLabel")}
                  placeholder={t("historyPhysicalExam.selectPlaceholder")}
                  value={companionTypeId}
                  onChange={(v) => setCompanionTypeId(v)}
                  options={companionTypeOptions}
                  disabled={!canEditMotivo || anamnesisType === "direct"}
                />
              </Grid>
            </Grid>

            <TextareaField
              label={t("historyPhysicalExam.chiefComplaintLabel")}
              placeholder={t("historyPhysicalExam.textPlaceholder")}
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
          title={t("historyPhysicalExam.sections.backgrounds")}
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
          title={t("historyPhysicalExam.sections.reconciliation")}
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
  const { t } = useTranslation("clinical-record");
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
          date: formatDate(item.date_create),
          backgroundType: item.background_name,
          description: item.description,
        })),
    [allBackgrounds, category],
  );

  const columnsTable = useMemo<GenericTableColumn<PatientBackgroundRow>[]>(
    () => [
      {
        key: "date",
        header: t("historyPhysicalExam.backgroundsTable.date"),
        type: "text",
        field: "date",
        width: 100,
        align: "center",
        clickable: false,
      },
      {
        key: "backgroundType",
        header: t("historyPhysicalExam.backgroundsTable.backgroundType"),
        type: "text",
        field: "backgroundType",
        width: 100,
        align: "center",
        clickable: false,
      },
      {
        key: "description",
        header: t("historyPhysicalExam.backgroundsTable.description"),
        type: "text",
        field: "description",
        width: 300,
        align: "center",
        clickable: false,
      },
    ],
    [t],
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
            {t("historyPhysicalExam.addButton")}
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
              date_create: new Date().toISOString(),
            },
          ]);
        }}
      />

      <SegmentedToggle<PatientBackgroundCategory>
        options={[
          {
            label: t("historyPhysicalExam.backgroundsCategories.general"),
            value: "general",
          },
          {
            label: t("historyPhysicalExam.backgroundsCategories.gynObstetric"),
            value: "gyn_obstetric",
          },
          {
            label: t("historyPhysicalExam.backgroundsCategories.pathological"),
            value: "pathological",
          },
        ]}
        value={category}
        onChange={setCategory}
        testId="clinical-record-history-physical-exam-backgrounds-category-toggle"
      />

      <Box sx={{ pt: 2 }}>
        <GenericTable
          emptyMessage={t("EmptyMessageDataTable")}
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
  const { t } = useTranslation("clinical-record");
  const { user } = useUser();
  const { registerTabData, getTabData } = useClinicalRecordForm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const RECONCILIATION_ACTION_LABELS: Record<string, string> = useMemo(
    () => ({
      continue: t("reconciliationActions.continue"),
      suspend: t("reconciliationActions.suspend"),
      modify: t("reconciliationActions.modify"),
    }),
    [t],
  );

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
        medication: item.medication_name,
        doseValue: item.dose_value,
        route: item.administration_route_description,
        frequencyValue: item.frequency_value,
        action:
          RECONCILIATION_ACTION_LABELS[item.reconciliation_action] ??
          item.reconciliation_action,
        dateTime: formatDateTime(item.last_dose_datetime),
      })),
    [allReconciliations, RECONCILIATION_ACTION_LABELS],
  );

  const handleDelete = (row: MedicationReconciliationRow) => {
    setAddedReconciliations((prev) =>
      prev.filter(
        (item) => String(item.medication_reconciliation_id) !== row.id,
      ),
    );
  };

  const columnsTable = useMemo<
    GenericTableColumn<MedicationReconciliationRow>[]
  >(
    () => [
      {
        key: "medication",
        header: t("historyPhysicalExam.reconciliationTable.medication"),
        type: "text",
        field: "medication",
        width: 200,
        align: "left",
        clickable: false,
      },
      {
        key: "doseValue",
        header: t("historyPhysicalExam.reconciliationTable.dose"),
        type: "text",
        field: "doseValue",
        width: 60,
        align: "center",
        clickable: false,
      },
      {
        key: "route",
        header: t("historyPhysicalExam.reconciliationTable.route"),
        type: "text",
        field: "route",
        width: 80,
        align: "center",
        clickable: false,
      },
      {
        key: "frequencyValue",
        header: t("historyPhysicalExam.reconciliationTable.frequency"),
        type: "text",
        field: "frequencyValue",
        width: 80,
        align: "center",
        clickable: false,
      },
      {
        key: "action",
        header: t("historyPhysicalExam.reconciliationTable.action"),
        type: "text",
        field: "action",
        width: 100,
        align: "center",
        clickable: false,
      },
      {
        key: "dateTime",
        header: t("historyPhysicalExam.reconciliationTable.dateTime"),
        type: "text",
        field: "dateTime",
        width: 140,
        align: "center",
        clickable: false,
      },
      {
        key: "delete",
        header: t("historyPhysicalExam.reconciliationTable.delete"),
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
    [readOnly, t],
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
            {t("historyPhysicalExam.addButton")}
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
              medication_legacy_code: payload.medication_legacy_code,
              medication_name: payload.medication_name,
              administration_route_id: payload.administration_route_id,
              administration_route_description:
                payload.administration_route_description,
              dose_value: payload.dose_value,
              frequency_value: payload.frequency_value,
              reconciliation_action: payload.reconciliation_action,
              last_dose_datetime: payload.last_dose_datetime,
              user_create: user?.username ?? "",
            },
          ]);
        }}
      />

      <GenericTable
        emptyMessage={t("EmptyMessageDataTable")}
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
  const { t, i18n } = useTranslation("clinical-record");
  const { user } = useUser();
  const { fetchHistoryPhysicalExam, loadingHistoryPhysicalExam } =
    useMedicalHistory();
  const { fetchCodeSystemValues, loadingCatalogCodeSystemValues } =
    useCatalog();
  const { registerTabData, getTabData } = useClinicalRecordForm();

  const formBusy = loadingHistoryPhysicalExam || loadingCatalogCodeSystemValues;

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

  useEffect(() => {
    // if (savedVitals) return;
    // if (encounterId === undefined) return;

    // const validEncounterId = encounterId;

    const load = async () => {
      // const data = await fetchHistoryPhysicalExam(validEncounterId);
      // if (!data?.physicalExam) return;
      // const v = data.physicalExam;
      // setOxygenSaturation(
      //   v.oxygen_saturation != null ? String(v.oxygen_saturation) : "",
      // );
      // setWeightKg(v.weight_kg != null ? String(v.weight_kg) : "");
      // setHeightCm(v.height_cm != null ? String(v.height_cm) : "");
      // setHeartRate(v.heart_rate != null ? String(v.heart_rate) : "");
      // setRespiratoryRate(
      //   v.respiratory_rate != null ? String(v.respiratory_rate) : "",
      // );
      // setSystolicPressure(
      //   v.systolic_pressure != null ? String(v.systolic_pressure) : "",
      // );
      // setDiastolicPressure(
      //   v.diastolic_pressure != null ? String(v.diastolic_pressure) : "",
      // );
      // setTemperatureC(v.temperature_c != null ? String(v.temperature_c) : "");
      // registerTabData("historyPhysicalExam.physicalExamVitals", v);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounterId]);

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

  useEffect(() => {
    if (savedVitals) return;
    if (encounterId === undefined) return;

    const validEncounterId = encounterId;

    const load = async () => {
      const result = await Promise.all([
        fetchCodeSystemValues(SLEEP_APPETITE_CODE_SYSTEM_ID),
        fetchCodeSystemValues(URINE_STOOL_WEIGHT_CODE_SYSTEM_ID),
        fetchHistoryPhysicalExam(validEncounterId),
      ]);
      const [
        biologicalFunctionsSAData,
        biologicalFunctionsUSWData,
        historyPhysicalExamData,
      ] = result;

      if (biologicalFunctionsSAData) {
        setSleepAppetiteOptions(
          (biologicalFunctionsSAData ?? [])
            .filter((item) => item.is_active)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((item) => ({
              value: item.code,
              label: getLocalizedCatalogDisplay(
                {
                  display_es: item.display_es,
                  display_en: item.display_en,
                },
                i18n.language,
                item.display,
              ),
              // item.display
            })),
        );
      }
      if (biologicalFunctionsUSWData) {
        setUrineStoolWeightOptions(
          (biologicalFunctionsUSWData ?? [])
            .filter((item) => item.is_active)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((item) => ({ value: item.code, label: item.display })),
        );
      }
      if (historyPhysicalExamData) {
        if (!historyPhysicalExamData?.physicalExam) return;

        const v = historyPhysicalExamData.physicalExam;
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
      }
    };
    load();
  },[encounterId,i18n.language]);

  // useEffect(() => {
  //   const load = async () => {
  //     // const data = await fetchCodeSystemValues(SLEEP_APPETITE_CODE_SYSTEM_ID);
  //     // setSleepAppetiteOptions(
  //     //   (data ?? [])
  //     //     .filter((item) => item.is_active)
  //     //     .sort((a, b) => a.sort_order - b.sort_order)
  //     //     .map((item) => ({ value: item.code,
  //     //       label:
  //     //       getLocalizedCatalogDisplay(
  //     //               {
  //     //                 display_es: item.display_es,
  //     //                 display_en: item.display_en,
  //     //               },
  //     //               i18n.language,
  //     //               item.display,
  //     //             ),
  //     //       // item.display
  //     //     })),
  //     // );
  //   };
  //   load();
  //   console.log("cargando idioma: ", i18n.language);
  // }, [fetchCodeSystemValues, i18n.language]);

  // useEffect(() => {
  //   const load = async () => {
  //     // const data = await fetchCodeSystemValues(
  //     //   URINE_STOOL_WEIGHT_CODE_SYSTEM_ID,
  //     // );
  //     // setUrineStoolWeightOptions(
  //     //   (data ?? [])
  //     //     .filter((item) => item.is_active)
  //     //     .sort((a, b) => a.sort_order - b.sort_order)
  //     //     .map((item) => ({ value: item.code, label: item.display })),
  //     // );
  //   };
  //   load();
  // }, [fetchCodeSystemValues]);

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
    <Box>
      <LoadingOverlay
        open={formBusy}
        message={"Cargando información..."}
      />

          <div className="hce-examen-fisico">
      <Box sx={{ fontWeight: 600, mb: 2 }}>
        {t("historyPhysicalExam.physicalExam.title")}
      </Box>

      <TextareaField
        label={t("historyPhysicalExam.physicalExam.descriptionLabel")}
        placeholder={t("historyPhysicalExam.textPlaceholder")}
        value={examDescription}
        onChange={setExamDescription}
        maxLength={1000}
        disabled={readOnly}
      />

      <Box sx={{ fontWeight: 600, mt: 3, mb: 2 }}>
        {t("historyPhysicalExam.physicalExam.vitalsTitle")}
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "16px",
        }}
      >
        <NumericField
          label={t("historyPhysicalExam.physicalExam.vitals.oxygenSaturation")}
          value={oxygenSaturation}
          onChange={setOxygenSaturation}
          suffix="%"
          unitLabel="% O2"
          numberType="natural"
          disabled={readOnly}
        />
        <NumericField
          label={t("historyPhysicalExam.physicalExam.vitals.weight")}
          value={weightKg}
          onChange={setWeightKg}
          suffix="Kg"
          unitLabel="kg"
          numberType="decimal"
          disabled={readOnly}
        />
        <NumericField
          label={t("historyPhysicalExam.physicalExam.vitals.height")}
          value={heightCm}
          onChange={setHeightCm}
          suffix="cm"
          unitLabel="cm"
          numberType="natural"
          disabled={readOnly}
        />
        <NumericField
          label={t("historyPhysicalExam.physicalExam.vitals.heartRate")}
          value={heartRate}
          onChange={setHeartRate}
          suffix="lpm"
          unitLabel="lpm"
          numberType="natural"
          disabled={readOnly}
        />
        <NumericField
          label={t("historyPhysicalExam.physicalExam.vitals.respiratoryRate")}
          value={respiratoryRate}
          onChange={setRespiratoryRate}
          suffix="rpm"
          unitLabel="rpm"
          numberType="natural"
          disabled={readOnly}
        />
        <NumericField
          label={t("historyPhysicalExam.physicalExam.vitals.systolicPressure")}
          value={systolicPressure}
          onChange={setSystolicPressure}
          suffix="mmHg"
          unitLabel="mmHg"
          numberType="natural"
          disabled={readOnly}
        />
        <NumericField
          label={t("historyPhysicalExam.physicalExam.vitals.diastolicPressure")}
          value={diastolicPressure}
          onChange={setDiastolicPressure}
          suffix="mmHg"
          unitLabel="mmHg"
          numberType="natural"
          disabled={readOnly}
        />
        <NumericField
          label={t("historyPhysicalExam.physicalExam.vitals.temperature")}
          value={temperatureC}
          onChange={setTemperatureC}
          suffix="°C"
          unitLabel="°C"
          numberType="decimal"
          disabled={readOnly}
        />
      </Box>

      <Box sx={{ fontWeight: 600, mt: 3, mb: 2 }}>
        {t("historyPhysicalExam.physicalExam.biologicalFunctionsTitle")}
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "16px",
        }}
      >
        <SelectField
          label={t(
            "historyPhysicalExam.physicalExam.biologicalFunctions.sleep",
          )}
          placeholder={t("historyPhysicalExam.selectPlaceholder")}
          value={sleepFunction}
          onChange={setSleepFunction}
          options={sleepAppetiteOptions}
          disabled={readOnly}
        />
        <SelectField
          label={t(
            "historyPhysicalExam.physicalExam.biologicalFunctions.appetite",
          )}
          placeholder={t("historyPhysicalExam.selectPlaceholder")}
          value={appetiteFunction}
          onChange={setAppetiteFunction}
          options={sleepAppetiteOptions}
          disabled={readOnly}
        />
        <SelectField
          label={t(
            "historyPhysicalExam.physicalExam.biologicalFunctions.urine",
          )}
          placeholder={t("historyPhysicalExam.selectPlaceholder")}
          value={urineFunction}
          onChange={setUrineFunction}
          options={urineStoolWeightOptions}
          disabled={readOnly}
        />
        <SelectField
          label={t(
            "historyPhysicalExam.physicalExam.biologicalFunctions.stool",
          )}
          placeholder={t("historyPhysicalExam.selectPlaceholder")}
          value={stoolFunction}
          onChange={setStoolFunction}
          options={urineStoolWeightOptions}
          disabled={readOnly}
        />
        <SelectField
          label={t(
            "historyPhysicalExam.physicalExam.biologicalFunctions.weight",
          )}
          placeholder={t("historyPhysicalExam.selectPlaceholder")}
          value={weightFunction}
          onChange={setWeightFunction}
          options={urineStoolWeightOptions}
          disabled={readOnly}
        />
      </Box>
    </div>
    </Box>
  );
};
