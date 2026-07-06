/**
 * ---------------------------------------------------------
 * Service: triage.service
 * Registra el formulario de triaje.
 * Endpoints:
 * - POST triage/form
 * ---------------------------------------------------------
 */
import { ENDPOINTS } from "../config/endpoints";
import { apiFetch } from "shell/ApiClient";
import type { TriageFormRequest, TriageFormResponse } from "../types/triage.types";

export async function postTriageForm(
  payload: TriageFormRequest,
): Promise<unknown> {
  const res = await apiFetch(ENDPOINTS.triage.CreateForm(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => null)) as TriageFormResponse | null;

  if (!res.ok || !json?.success) {
    throw new Error(json?.message || `Error ${res.status} al registrar el triaje`);
  }

  return json.data;
}
