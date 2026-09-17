export type DiagnosisDirection = "admission" | "discharge";
export type DiagnosisClassification =
  | "presumptive"
  | "repetitive"
  | "definitive";

export interface DiagnosisApiItem {
  diagnosis_id: number;
  encounter_id: number;
  cie_id: number;
  diagnosis_type: DiagnosisDirection;
  classification: DiagnosisClassification;
  origin_diagnosis_id: number | null;
  is_active: boolean;
  cie_code: string;
  cie_description: string;
}

export interface DiagnosesByEncounterResponse {
  data: DiagnosisApiItem[];
}

export interface NewDiagnosisPayload {
  encounter_id: number;
  cie_id: number;
  diagnosis_type: DiagnosisDirection;
  classification: DiagnosisClassification;
  user_create: string;
}
