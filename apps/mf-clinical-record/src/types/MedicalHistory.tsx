export interface medicalHistoryApiResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data: medicalHistoryApiData[];
  meta: medicalHistoryApiMeta;
}

export interface medicalHistoryApiData {
  encounter_id: number;
  sic_attention_id: string;
  admission_datetime: string;
  record_type: string;
  encounter_class: string;
  encounter_class_display: string;
  practitioner_name: string;
  speciality_name: string;
}

export interface PatientBackgroundRow {
  id: string;
  date: string;
  backgroundType: string; // ej. "Tabaco"
  description: string;
}

export interface PatientBackgroundApiItem {
  patient_background_id: number;
  background_catalog_id: number;
  background_name: string;
  background_category: "general" | "gyn_obstetric" | "pathological";
  is_present: boolean;
  description: string;
  user_create?: string;
  date_create?: string;
}
export interface medicalHistoryApiMeta {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface PatientBackgroundSavePayload {
  background_catalog_id: number;
  is_present: boolean;
  description: string;
  user_create: string;
}

export interface MedicalHistorySavePayload {
  anamnesis?: AnamnesisPayload;
  physicalExam?: PhysicalExamPayload;
  patientBackgrounds?: PatientBackgroundSavePayload[];
}

export interface AnamnesisPayload {
  anamnesis_type: "direct" | "indirect" | null;
  companion_type_id: number | null;
  chief_complaint: string;
  user_create: string;
}

export interface PhysicalExamPayload {
  exam_description: string;
  sleep_function: string;
  appetite_function: string;
  urine_function: string;
  stool_function: string;
  weight_function: string;
  user_create: string;
}

export interface PhysicalExamApiItem {
  physical_exam_id: number | null;
  is_prefill: boolean;
  source_vital_sign_id: number | null;
  oxygen_saturation: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  heart_rate: number | null;
  respiratory_rate: number | null;
  systolic_pressure: number | null;
  diastolic_pressure: number | null;
  temperature_c: number | null;
  sleep_function: string | null;
  appetite_function: string | null;
  urine_function: string | null;
  stool_function: string | null;
  weight_function: string | null;
}

// types/MedicalHistory.tsx
export interface MedicationReconciliationApiItem {
  medication_reconciliation_id: number;
  medication_product_id: number;
  medication_display: string;
  administration_route_id: number;
  administration_route_description: string;
  dose_value: number;
  dose_unit?: string;
  frequency_value: number;
  frequency_unit?: string;
  reconciliation_action: string;
  last_dose_datetime?: string; // ⚠️ nuevo
  user_create?: string;
}

export interface HistoryPhysicalExamApiData {
  anamnesis: AnamnesisPayload & { anamnesis_id: number | null };
  physicalExam: PhysicalExamApiItem;
  patientBackgrounds: PatientBackgroundApiItem[];
  medicationReconciliations: MedicationReconciliationApiItem[];
}

export interface HistoryPhysicalExamApiResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data: HistoryPhysicalExamApiData; 
}

export interface MedicationReconciliationRow {
  id: string;
  medication: string;
  doseValue: number;
  route: string;
  frequencyValue: number;
  action: string;
  dateTime: string;
}

export interface MedicationReconciliationSavePayload {
  medication_product_id: number;
  administration_route_id: number;
  dose_value: number;
  frequency_value: number;
  reconciliation_action: string;
  last_dose_datetime: string;
  user_create: string;
}

export interface MedicalHistorySavePayload {
  anamnesis?: AnamnesisPayload;
  physicalExam?: PhysicalExamPayload;
  patientBackgrounds?: PatientBackgroundSavePayload[];
  medicationReconciliations?: MedicationReconciliationSavePayload[];
}
