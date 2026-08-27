export interface AllergyForm {
  allergy_id: string;
  encounter_id: string;
  has_allergy: boolean;
  api: string[] | [];
  food: string | null;
  other: string | null;

}

export function mapAllergyApiItemToAvailabilityItem(allergy: AllergyForm) {
  return {
    allergy_id:     String(allergy.allergy_id),
    encounter_id:   allergy.encounter_id,
    has_allergy: allergy.has_allergy,
    api:  allergy.api ?? '-',
    food: allergy.food ?? '-',
    other: allergy.other?? '-'
  }
}