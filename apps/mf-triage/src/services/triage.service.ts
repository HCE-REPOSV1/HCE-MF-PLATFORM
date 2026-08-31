/**
 * ---------------------------------------------------------
 * Service: triage.service
 * Registra el formulario de triaje y obtiene el triaje completo.
 * Endpoints:
 * - POST triage/form
 * - GET  triage/:id/full
 * ---------------------------------------------------------
 */
import { ENDPOINTS } from "../config/endpoints";
import { apiFetch } from "shell/ApiClient";
import type { TriageFormRequest, TriageFormResponse, TriageFullData, TriageFullResponse } from "../types/triage.types";

import { resolveStatusError, TRIAGE_ERROR_CODES } from "../i18n/errorCodes";




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

     const codigo = res.status;

    const translationKey =
      TRIAGE_ERROR_CODES[codigo] ??
      resolveStatusError(res.status);

    throw new Error(translationKey);
   //throw new Error(json?.message || `Error ${res.status} al registrar el triaje`);
   
  }

  return json.data;
}

export async function getTriageFull(
  triageId: string | number,
): Promise<TriageFullData | null> {
  const res = await apiFetch(ENDPOINTS.triage.Full(triageId));

  if (res.status === 404) return null;

  const json = (await res.json().catch(() => null)) as TriageFullResponse | null;

  if (!res.ok || !json?.success) {
    throw new Error(json?.message || `Error ${res.status} al obtener el triaje`);
  }

  return json.data;
}
