// hooks/usePatientRecord.tsx
import { useCallback, useEffect, useState } from "react";
import { i18n } from "@hce/i18n-core";
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

  // i18n.language se agrega como dependencia del efecto de abajo: gender_display/
  // speciality_display/provider_name/product_name vienen ya resueltos por el
  // backend según el header Accept-Language que se manda en el momento del
  // fetch (ver apiFetch en mf-shell) -- si el usuario cambia de idioma en
  // caliente hay que volver a pedir el recurso para que esos campos se
  // actualicen (mismo patrón que ExamenFisicoContent en HistoryPhysicalExam.tsx).
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
  }, [encounterId, tick, i18n.language]);

  return { data, loading, error, refetch };
}
