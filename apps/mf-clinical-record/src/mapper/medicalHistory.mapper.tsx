import type {
  AnamnesisPayload,
  medicalHistoryApiData,
  MedicalHistorySavePayload,
  MedicationReconciliationApiItem,
  MedicationReconciliationSavePayload,
  PatientBackgroundApiItem,
  PatientBackgroundSavePayload,
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
    medication_legacy_code: item.medication_legacy_code,
    administration_route_id: item.administration_route_id,
    dose_value: item.dose_value,
    frequency_value: item.frequency_value,
    reconciliation_action: item.reconciliation_action,
    last_dose_datetime: item.last_dose_datetime ?? "",
    user_create: item.user_create ?? "",
  }));

  return {
    anamnesis,
    patientBackgrounds,
    medicationReconciliations,
  };
}