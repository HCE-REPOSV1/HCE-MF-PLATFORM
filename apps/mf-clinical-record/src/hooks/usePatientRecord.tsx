// hooks/usePatientRecord.tsx
import { useCallback, useEffect, useState } from "react";
import { getPatientRecord } from "../services/patientRecord.service";
import type { PatientRecordApi } from "../types/Patient.type";

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
