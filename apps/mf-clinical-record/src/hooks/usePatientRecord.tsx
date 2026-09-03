// hooks/usePatientRecord.tsx
import { useCallback, useEffect, useState } from "react";
import { getPatientRecord } from "../services/patientRecord.service";
import type { PatientRecordApi } from "../types/Patient.type";

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


export interface UsePatientRecordResult {
  data: PatientRecordApi | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Trae el paciente/encounter real (name, doc, alergias, etc.) para el encounterId dado. */
export function usePatientRecord(
  encounterId?: number,
): UsePatientRecordResult {
  const [data, setData] = useState<PatientRecordApi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => {
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!encounterId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchPatientRecord = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPatientRecord(encounterId);
        if (!cancelled) {
          setData(response);
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
  }, [encounterId, tick]);

  return { data, loading, error, refetch };
}
