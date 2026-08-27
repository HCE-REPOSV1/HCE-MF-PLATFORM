import { apiFetch } from "shell/ApiClient";
import { ENDPOINTS } from "../config/endpoints";
import type {
  medicalHistoryApiData,
  medicalHistoryApiResponse,
} from "../types/MedicalHistory";

export async function getMedicalHistory(
  patientId: number,
): Promise<medicalHistoryApiData[] | null> {
  const res = await apiFetch(
    ENDPOINTS.medicalRecords.medicalRecordByPatiente(patientId),
  );
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(`Error ${res.status} al obtener datos del historial clínico`);

  const json = (await res.json()) as medicalHistoryApiResponse;
  if (!json.success) return null;
  return json.data;
}
