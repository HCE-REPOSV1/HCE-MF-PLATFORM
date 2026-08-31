export interface AllergySubstanceAPI {
  allergy_substance_id: number;
  active_principle_id: number;
  active_principle_name?: string;
}

export interface AllergyAPIForm {
  allergy_intolerance_id: number;
  encounter_id: number;

  // Según lo que muestras en tu componente,
  // backend aparentemente devuelve "S" / "N"
  has_allergies: "S" | "N";

  substances?: AllergySubstanceAPI[] | null;

  food_allergies: string | null;
  other_allergies: string | null;
}

export interface AllergyForm {
  allergy_id: number;
  encounter_id: number;
  has_allergy: boolean;

  // IMPORTANTE: aquí guardamos IDs, no nombres
  api: string[];

  food: string;
  other: string;
}

export interface AllergyTableItem extends AllergyForm {
  apiLabels: string[];
}

export function mapAllergyApiToForm(
  allergy: AllergyAPIForm,
): AllergyForm {
  return {
    allergy_id: allergy.allergy_intolerance_id,
    encounter_id: allergy.encounter_id,
    has_allergy: allergy.has_allergies === "S",

    api: (allergy.substances ?? []).map((substance) =>
      String(substance.active_principle_id),
    ),

    food: allergy.food_allergies ?? "",
    other: allergy.other_allergies ?? "",
  };
}
