import { apiFetch } from "shell/ApiClient";
import { ENDPOINTS } from "../config/endpoints";
import type { clinicalRecordApiResponse, clinicalRecordApiData } from "../types/clinical.record.types";

export async function getMedicalRecordTable(patientId:number): Promise<
  clinicalRecordApiData[] | null
> {
  const res = await apiFetch(ENDPOINTS.medicalRecords.medicalRecordByPatiente(patientId));
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(`Error ${res.status} al obtener datos del Catalog Cie`);

  const json = (await res.json()) as clinicalRecordApiResponse;
  if (!json.success) return null;
  return json.data;
}
