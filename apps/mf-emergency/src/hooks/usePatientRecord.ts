import { useCallback, useEffect, useState } from "react";
import { ENDPOINTS } from "../config/endpoints";

export interface PatientIdentifier {
  practitioner_id: number;
  doctor_name: string;
  speciality_id: number;
  speciality_es: string | null;
  speciality_en: string | null;
}

export interface AllergySubstances {
  allergy_substance_id: number ;
  active_principle_id: number;
  active_principle_name: string;
 
}

export interface Declaration {
  allergy_intolerance_id: number;
  triage_id: string;
  has_allergies: "S" | "N";
  food_allergies: string | null;
  other_allergies: string | null;
  declared_at: string;
  substances: AllergySubstances[];
}

export interface PatientAllergy{

  encounter_id: number;
    has_triage: string;
  
    has_declaration: string;
    declaration: Declaration | null;
}

export interface PatientRecord {
  encounter_id: number;
  encounter_class: string;

  attention_code: string;
  clinical_history_number: string;
  patient_id: string;

  full_name:string;
  gender: string;
  birth_date: string;
 age_display: string;
 document_type:string;
 document_number:string;

  blood_type: string | null;

  phone: string | null;
  email: string | null;
  address: string | null;

  insurance:string| null ;
 

  attending_practitioner?: PatientIdentifier  | null;
  allergy?: PatientAllergy;
}

interface PatientRecordResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PatientRecord;
}

export interface UsePatientRecordResult {
  data: PatientRecord | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
export function usePatientRecord(
  patientId?: number,
): UsePatientRecordResult {
  const [record, setRecord] = useState<{
    patientId: number;
    data: PatientRecord;
  } | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [tick, setTick] =
    useState(0);

  const refetch = useCallback(() => {
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!patientId) {
      return;
    }

    const controller = new AbortController();

    const fetchPatientRecord = async () => {
      try {
        setLoading(true);
        setError(null);

        const url =
          ENDPOINTS.encounter.patientInfo(
            patientId,
          );

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`,
          );
        }

        const payload: PatientRecordResponse =
          await response.json();

        if (!controller.signal.aborted) {
          setRecord({ patientId, data: payload.data });
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Error al obtener la información del paciente",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPatientRecord();

    return () => {
      controller.abort();
    };
  }, [patientId, tick]);

  return {
    data: record && record.patientId === patientId ? record.data : null,
    loading: Boolean(patientId) && loading,
    error: patientId ? error : null,
    refetch,
  };
}
