

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

export interface AllergyDetailApi {
  allergy_id: string;
  encounter_id: string;
  api: string[];
  food: string[];
  other: string | null;
}

export interface AllergyRowTable {
  api: string[];
  food: string[];
  other: string | null;
}

export interface PatientInformationModalProps {
  open: boolean;
  onClose: () => void;
  patient: ClinicalRecordPatient | null;
  onAllergiesClick?: () => void;
}

export interface PatientFieldProps {
  label: string;
  value?: React.ReactNode | null;
  align?: "left" | "center" | "right";
}

export type SemaphoreColor = "green" | "yellow" | "red" | null;

export interface clinicalRecordApiResponse {
  success:  boolean;
  statusCode: number;
  message:  string;
  data:     clinicalRecordApiData[];
}


export interface clinicalRecordApiData {
  encounter_id: number;
  sic_attention_id: string;
  admission_datetime: string;
  record_type: string;
  encounter_class: string;
  encounter_class_display: string;
  practitioner_name: string;
  speciality_name: string;
}
