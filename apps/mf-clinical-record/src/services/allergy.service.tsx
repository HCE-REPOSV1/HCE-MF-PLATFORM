// services/allergy.service.tsx
import { apiFetch } from "shell/ApiClient";
import { ENDPOINTS } from "../config/endpoints";
import type {
  AllergyEncounterApi,
  AllergyEncounterApiResponse,
  UpdateAllergyDeclarationRequest,
} from "../types/Allergy.type";

export async function getAllergyDeclaration(
  encounterId: number,
): Promise<AllergyEncounterApi | null> {
  const res = await apiFetch(ENDPOINTS.encounter.allergyInfo(encounterId));
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(`Error ${res.status} al obtener la declaración de alergias`);

  const json = (await res.json()) as AllergyEncounterApiResponse;
  if (!json.success) return null;
  return json.data;
}

export async function updateAllergyDeclaration(
  encounterId: number,
  declaration: UpdateAllergyDeclarationRequest,
): Promise<AllergyEncounterApi | null> {
  const res = await apiFetch(ENDPOINTS.encounter.updateAllergy(encounterId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(declaration),
  });

  if (!res.ok)
    throw new Error(`Error ${res.status} al guardar la declaración de alergias`);

  const json = (await res.json().catch(() => null)) as
    | AllergyEncounterApiResponse
    | null;
  return json?.data ?? null;
}
