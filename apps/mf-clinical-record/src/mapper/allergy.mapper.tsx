import type { AllergyDeclarationApi } from "../types/Allergy.type";

export interface AllergyForm {
  allergy_id: number;
  encounter_id: number;
  has_allergy: boolean;
  /** IDs (como string, para compatibilizar con el value de MultiSelect), no nombres. */
  api: string[];
  food: string;
  other: string;
}

export interface AllergyTableItem extends AllergyForm {
  apiLabels: string[];
}

/** Mapea la declaración cruda del backend (GET .../allergy-declaration) al form que usa el modal. */
export function mapAllergyApiToForm(
  declaration: AllergyDeclarationApi,
  encounterId: number,
): AllergyForm {
  return {
    allergy_id: declaration.allergy_intolerance_id,
    encounter_id: encounterId,
    has_allergy: declaration.has_allergies === "S",
    api: (declaration.substances ?? []).map((substance) =>
      String(substance.active_principle_id),
    ),
    food: declaration.food_allergies ?? "",
    other: declaration.other_allergies ?? "",
  };
}
