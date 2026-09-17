// services/medicalHistory.service.tsx
import { apiFetch } from "shell/ApiClient";
import { ENDPOINTS } from "../config/endpoints";
import type {
  medicalHistoryApiResponse,
  HistoryPhysicalExamApiResponse,
  HistoryPhysicalExamApiData,
  MedicalHistorySavePayload,
} from "../types/MedicalHistory";

export async function getMedicalHistory(
  patientId: number,
  page = 1,
  limit = 20,
): Promise<medicalHistoryApiResponse | null> {
  const res = await apiFetch(
    ENDPOINTS.medicalRecords.medicalRecordByPatiente(patientId, page, limit),
  );
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(`Error ${res.status} al obtener datos del historial clínico`);

  const json = (await res.json()) as medicalHistoryApiResponse;
  if (!json.success) return null;
  return { data: json.data, meta: json.meta };
}

export async function getHistoryPhysicalExam(
  encounter_id: number,
): Promise<HistoryPhysicalExamApiData | null> {
  const res = await apiFetch(
    ENDPOINTS.medicalRecords.getHistoryPhysicalExam(encounter_id), // ✅ endpoint correcto
  );
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(`Error ${res.status} al obtener anamnesis y examen físico`);

  const json = (await res.json()) as HistoryPhysicalExamApiResponse;
  if (!json.success) return null;
  return json.data; // ✅ un solo objeto, no array
}

/**
 * POST /encounter/:id/clinical (mismo path que getHistoryPhysicalExam, solo
 * cambia el método) — guarda cualquier combinación de anamnesis/physicalExam/
 * patientBackgrounds/medicationReconciliations en una transacción atómica
 * (ver HU09). anamnesis/physicalExam son upsert; patientBackgrounds y
 * medicationReconciliations SIEMPRE insertan filas nuevas — el backend
 * rechaza con 400 si el body incluye un id, así que nunca hay que mandar acá
 * los ítems ya existentes/hidratados, solo los recién agregados por el
 * usuario en esta sesión.
 */
export async function saveHistoryPhysicalExam(
  encounter_id: number,
  payload: MedicalHistorySavePayload,
): Promise<void> {
  const url = ENDPOINTS.medicalRecords.getHistoryPhysicalExam(encounter_id);
  // eslint-disable-next-line no-console -- temporal, para verificar en QA que el payload sale como se espera
  console.log("[saveHistoryPhysicalExam] POST", url, payload);

  const res = await apiFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => null)) as
    | { success?: boolean; message?: string }
    | null;

  // eslint-disable-next-line no-console -- temporal, ver arriba
  console.log("[saveHistoryPhysicalExam] response", res.status, json);

  if (!res.ok || !json?.success) {
    throw new Error(
      json?.message ??
        `Error ${res.status} al guardar anamnesis y examen físico`,
    );
  }
}