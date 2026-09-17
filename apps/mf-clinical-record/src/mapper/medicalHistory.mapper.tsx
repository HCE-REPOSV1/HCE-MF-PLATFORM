import type {
  AnamnesisPayload,
  medicalHistoryApiData,
  MedicalHistorySavePayload,
  MedicationReconciliationApiItem,
  MedicationReconciliationSavePayload,
  PatientBackgroundApiItem,
  PatientBackgroundSavePayload,
  PhysicalExamApiItem,
  PhysicalExamPayload,
  PhysicalExamSavePayload,
} from "../types/MedicalHistory";

export const mapMedicalHistoryApiItemToTableRow = (
  item: medicalHistoryApiData,
): medicalHistoryApiData => {
  return {
    encounter_id: item.encounter_id,
    sic_attention_id: item.sic_attention_id,
    admission_datetime: item.admission_datetime,
    record_type: item.record_type,
    encounter_class: item.encounter_class,
    encounter_class_display: item.encounter_class_display,
    practitioner_name: item.practitioner_name,
    speciality_name: item.speciality_name,
  };
};

export function mapToSavePayload(
  rawData: Record<string, unknown>,
): MedicalHistorySavePayload {
  const anamnesis = rawData["historyPhysicalExam.anamnesis"] as
    | AnamnesisPayload
    | undefined;

  // physicalExam real (POST /encounter/:id/clinical, ver HU09) combina las
  // funciones biológicas ("historyPhysicalExam.physicalExam") con
  // oxygen_saturation/weight_kg de los signos vitales
  // ("historyPhysicalExam.physicalExamVitals") — son dos registerTabData
  // separados en HistoryPhysicalExam.tsx, se mergean solo acá al armar el
  // payload de guardado.
  const physicalExamForm = rawData["historyPhysicalExam.physicalExam"] as
    | PhysicalExamPayload
    | undefined;
  const physicalExamVitals = rawData[
    "historyPhysicalExam.physicalExamVitals"
  ] as PhysicalExamApiItem | undefined;

  const physicalExam: PhysicalExamSavePayload | undefined = physicalExamForm
    ? {
        ...physicalExamForm,
        oxygen_saturation: physicalExamVitals?.oxygen_saturation ?? null,
        weight_kg: physicalExamVitals?.weight_kg ?? null,
      }
    : undefined;

  const addedBackgrounds = rawData[
    "historyPhysicalExam.addedPatientBackgrounds"
  ] as PatientBackgroundApiItem[] | undefined;

  const patientBackgrounds: PatientBackgroundSavePayload[] | undefined =
    addedBackgrounds?.map((item) => ({
      background_catalog_id: item.background_catalog_id,
      is_present: item.is_present,
      description: item.description,
      user_create: item.user_create ?? "",
    }));

  const addedReconciliations = rawData[
    "historyPhysicalExam.addedMedicationReconciliations"
  ] as MedicationReconciliationApiItem[] | undefined;

  const medicationReconciliations:
    | MedicationReconciliationSavePayload[]
    | undefined = addedReconciliations?.map((item) => ({
    medication_name: item.medication_name,
    medication_legacy_code: item.medication_legacy_code,
    administration_route_id: item.administration_route_id,
    dose_value: item.dose_value,
    dose_unit: item.dose_unit,
    frequency_value: item.frequency_value,
    frequency_unit: item.frequency_unit,
    reconciliation_action: item.reconciliation_action,
    last_dose_datetime: item.last_dose_datetime ?? "",
    user_create: item.user_create ?? "",
  }));

  return {
    anamnesis,
    physicalExam,
    patientBackgrounds,
    medicationReconciliations,
  };
}