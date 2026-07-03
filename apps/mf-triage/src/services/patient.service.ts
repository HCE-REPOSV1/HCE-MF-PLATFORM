/**
 * ---------------------------------------------------------
 * Service: patient.service
 * Obtiene los datos del patient.
 * Endpoints:
 * - GET patient/by-identifier?identifier_value=${idValue}&identifier_type=${idType}
 * -
 * ---------------------------------------------------------
 */
import { ENDPOINTS } from "../config/endpoints";
import { apiFetch } from "shell/ApiClient";

export interface Patient {
  patient_id: string;
  patient_uuid: string;
  first_name: string;
  last_name_father: string;
  last_name_mother: string;
  birth_date: string;
  gender: string;
  blood_type: string;
  phone: string;
  email: string;
  is_unknown_patient: boolean;
  ni_correlative: boolean | null;
  is_reniec_verified: boolean;
  is_sic_integrated: boolean;
  legacy_patient_id: string;
  user_create: string;
  user_modify: string;
  date_create: string;
  date_modify: string;
  is_vip: boolean;
  estimated_age_group: boolean | null;
  is_active: boolean;
}

interface PatientResponse {
  success: boolean
  message: string
  data:    Patient
}

export async function getPatientByIdentifier(
  idValue: string | null | undefined,
  idType: string | null | undefined,
): Promise<Patient | null> {
  const res = await apiFetch(ENDPOINTS.patients.ByIdentifier(idValue, idType));
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(`Error ${res.status} al obtener datos del practitioner`);

  const json = (await res.json()) as PatientResponse;
  if (!json.success) return null;
  return json.data;
}
