// services/medicalHistory.service.tsx
import { apiFetch } from "shell/ApiClient";
import { ENDPOINTS } from "../config/endpoints";
import type {
  medicalHistoryApiResponse,
  HistoryPhysicalExamApiResponse,
  HistoryPhysicalExamApiData,
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