export interface ClinicalRecordPatient {
  patientId: string;
  fullName: string;
  gender: string;
  ageDisplay: string;
  documentType: string;
  documentNumber: string;
  bloodType: string;
  specialty: string;

  doctorName?: string | null;
  attentionCode?: string | null;
  clinicalHistoryNumber?: string | null;
  insuranceName?: string | null;
  insuranceProduct?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  photoUrl?: string | null;

  hasAllergies: boolean;
}

/** Estado navegado desde MonitorPage/mf-emergency al hacer clic en un paciente (navigate("historiacli", { state: { patient: row } })). */
export interface NavigatedPatientState {
  encounter_id?: number;
  patient_id?: number | string;
}

/** Practicante/médico tratante, tal como lo devuelve GET /encounter/:id/patient-summary. */
export interface PatientRecordPractitioner {
  practitioner_id: number;
  doctor_name: string;
  speciality_id: number;
  speciality_es: string | null;
  speciality_en: string | null;
}

/** Respuesta cruda de GET /encounter/:id/patient-summary (mismo contrato que consume mf-emergency). */
export interface PatientRecordApi {
  encounter_id: number;
  encounter_class: string;
  attention_code: string;
  clinical_history_number: string;
  patient_id: string;

  full_name: string;
  gender: string;
  birth_date: string;
  age_display: string;
  document_type: string;
  document_number: string;

  blood_type: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  insurance: string | null;

  attending_practitioner?: PatientRecordPractitioner | null;
  allergy?: {
    encounter_id: number;
    has_triage: string;
    has_declaration: string;
    declaration?: {
      has_allergies: "S" | "N";
    } | null;
  };
}

export interface PatientRecordApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PatientRecordApi;
}
