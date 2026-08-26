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
  const [data, setData] =
    useState<PatientRecord | null>(null);

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
      setData(null);
      setLoading(false);

      return;
    }

    let cancelled = false;

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
        });

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`,
          );
        }

        const payload: PatientRecordResponse =
          await response.json();

        if (!cancelled) {
          setData(payload.data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Error al obtener la información del paciente",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPatientRecord();

    return () => {
      cancelled = true;
    };
  }, [patientId, tick]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
