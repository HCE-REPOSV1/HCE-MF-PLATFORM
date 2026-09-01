// types/Allergy.type.tsx
// Mismo contrato que ya consume mf-emergency (GET/PATCH /encounter/:id/allergy-declaration).

export interface AllergySubstanceApi {
  allergy_substance_id: number;
  active_principle_id: number;
  active_principle_name?: string;
}

export interface AllergyDeclarationApi {
  allergy_intolerance_id: number;
  triage_id: string;
  has_allergies: "S" | "N";
  food_allergies: string | null;
  other_allergies: string | null;
  declared_at: string;
  substances: AllergySubstanceApi[];
}

export interface AllergyEncounterApi {
  encounter_id: number;
  has_triage: string;
  has_declaration: string;
  declaration: AllergyDeclarationApi | null;
}

export interface AllergyEncounterApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AllergyEncounterApi;
}

export interface UpdateAllergyDeclarationRequest {
  has_allergies: "S" | "N";
  food_allergies: string | null;
  other_allergies: string | null;
  active_principle_ids: number[];
  user_modify: string;
}
