export interface ClinicalRecordPatient {
  patientId: string
  fullName: string
  gender: string
  ageDisplay: string
  documentType: string
  documentNumber: string
  bloodType: string
  specialty: string

  doctorName?: string | null
  attentionCode?: string | null
  clinicalHistoryNumber?: string | null
  insuranceName?: string | null
  insuranceProduct?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  photoUrl?: string | null

  hasAllergies: boolean
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
  open: boolean
  onClose: () => void
  patient: ClinicalRecordPatient | null
  onAllergiesClick?: () => void
}

export interface PatientFieldProps {
  label: string
  value?: React.ReactNode | null
   align?: "left" | "center" | "right"
}