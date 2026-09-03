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
  speciality_id: number | null;
  /** Especialidad resuelta según Accept-Language (fallback a es). Reemplaza a los antiguos speciality_es/speciality_en. */
  speciality_display: string | null;
}

/** Dirección del paciente, tal como la devuelve GET /encounter/:id/patient-summary (PatientSummaryAddressDto). */
export interface PatientRecordAddress {
  address_line_1: string | null;
  address_line_2: string | null;
  /** Distrito */
  address_district: string | null;
  address_city: string | null;
  /** Departamento */
  address_state: string | null;
  address_country: string | null;
}

/** Seguro del encounter, tal como lo devuelve GET /encounter/:id/patient-summary (PatientSummaryInsuranceDto). */
export interface PatientRecordInsurance {
  insurance_provider_id: number | null;
  /** Nombre de la aseguradora resuelto según Accept-Language (fallback a es). Reemplaza a los antiguos provider_name_es/_en. */
  provider_name: string | null;
  insurance_product_id: number | null;
  /** Nombre del producto de seguro resuelto según Accept-Language (fallback a es). Reemplaza a los antiguos product_name_es/_en. */
  product_name: string | null;
}

/** Respuesta cruda de GET /encounter/:id/patient-summary (mismo contrato que consume mf-emergency). */
export interface PatientRecordApi {
  encounter_id: number;
  encounter_class: string;
  attention_code: string;
  clinical_history_number: string;
  patient_id: string;

  full_name: string;
  /** Código crudo (catalog.code_system_value, code_system GENDER). Ver gender_display para el texto ya traducido. */
  gender: string;
  /** Texto de gender resuelto según Accept-Language (fallback a es). Campo aditivo, no reemplaza a `gender`. */
  gender_display: string | null;
  birth_date: string;
  age_display: string;
  document_type: string;
  document_number: string;

  blood_type: string | null;
  phone: string | null;
  email: string | null;
  /** Objeto de dirección (PatientSummaryAddressDto), no string. Ver formatAddress() en utils/formatAddress.tsx para mostrarla como una sola línea. */
  address: PatientRecordAddress | null;
  insurance: PatientRecordInsurance | null;

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
