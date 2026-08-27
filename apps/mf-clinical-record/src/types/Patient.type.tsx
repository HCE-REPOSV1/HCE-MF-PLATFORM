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