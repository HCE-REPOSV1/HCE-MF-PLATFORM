/**
 * ---------------------------------------------------------
 * Service: diagnosis.service
 * HU10 · Diagnósticos de la atención.
 * Endpoints:
 * - GET encounter/diagnoses/by-encounter/:encounterId
 * - POST encounter/diagnoses
 * - PATCH encounter/diagnoses/:id/estado (nunca se elimina físicamente)
 * ---------------------------------------------------------
 */
import { apiFetch } from "shell/ApiClient";
import type {
  DiagnosesByEncounterResponse,
  DiagnosisApiItem,
  NewDiagnosisPayload,
} from "../types/Diagnosis.type";
import { ENDPOINTS } from "../config/endpoints";

export async function getDiagnosesByEncounter(
  encounterId: number,
): Promise<DiagnosisApiItem[] | null> {
  const res = await apiFetch(
    ENDPOINTS.encounterDiagnoses.byEncounter(encounterId),
  );
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(
      `Error ${res.status} al obtener los diagnósticos del encounter`,
    );

  const json = (await res.json()) as DiagnosesByEncounterResponse;
  return json.data ?? null;
}

export async function createDiagnosis(
  payload: NewDiagnosisPayload,
): Promise<void> {
  const res = await apiFetch(ENDPOINTS.encounterDiagnoses.create(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok)
    throw new Error(`Error ${res.status} al registrar el diagnóstico`);
}

export async function setDiagnosisActive(
  diagnosisId: number,
  isActive: boolean,
  userModify: string,
): Promise<void> {
  const res = await apiFetch(
    ENDPOINTS.encounterDiagnoses.updateStatus(diagnosisId),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        is_active: isActive ? 1 : 0,
        user_modify: userModify,
      }),
    },
  );
  if (!res.ok)
    throw new Error(
      `Error ${res.status} al actualizar el estado del diagnóstico`,
    );
}
