// services/patientRecord.service.tsx
import { apiFetch } from "shell/ApiClient";
import { ENDPOINTS } from "../config/endpoints";
import type {
  PatientRecordApi,
  PatientRecordApiResponse,
} from "../types/Patient.type";

export async function getPatientRecord(
  encounterId: number,
): Promise<PatientRecordApi | null> {
  const res = await apiFetch(ENDPOINTS.encounter.patientInfo(encounterId));
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(`Error ${res.status} al obtener la información del paciente`);

  const json = (await res.json()) as PatientRecordApiResponse;
  if (!json.success) return null;
  return json.data;
}
