import { useCallback, useEffect, useState } from "react";
import { ENDPOINTS } from "../config/endpoints";

export interface PatientIdentifier {
  identifier_id: number;
  identifier_type: string;
  identifier_value: string;
  is_primary: boolean;
}

export interface PatientRecord {
  patient_id: number;
  patient_uuid: string;

  first_name: string;
  last_name_father: string;
  last_name_mother: string;

  birth_date: string;
  gender: string;
  blood_type: string | null;

  phone: string | null;
  email: string | null;

  is_unknown_patient: boolean;
  ni_correlative: string | null;
  estimated_age_group: string | null;

  is_reniec_verified: boolean;
  is_sic_integrated: boolean;
  is_vip: boolean;

  legacy_patient_id: string | null;

  identifiers: PatientIdentifier[];
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
  patientId?: number | string,
): UsePatientRecordResult {
  const [data, setData] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

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

        const url = ENDPOINTS.patientRecord.patientInfo(patientId);

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
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