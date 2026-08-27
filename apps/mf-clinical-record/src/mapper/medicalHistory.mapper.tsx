import type { medicalHistoryApiData } from "../types/MedicalHistory";

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
