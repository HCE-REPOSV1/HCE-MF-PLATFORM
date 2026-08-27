export interface medicalHistoryApiResponse {
  success:  boolean;
  statusCode: number;
  message:  string;
  data:     medicalHistoryApiData[];
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