// hooks/useAllergyDeclaration.tsx
import { useCallback, useEffect, useState } from "react";
import { getAllergyDeclaration } from "../services/allergy.service";
import type { AllergyEncounterApi } from "../types/Allergy.type";

export interface UseAllergyDeclarationResult {
  data: AllergyEncounterApi | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Trae la declaración de alergias vigente del encounter dado. */
export function useAllergyDeclaration(
  encounterId?: number,
): UseAllergyDeclarationResult {
  const [data, setData] = useState<AllergyEncounterApi | null>(null);
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

    const fetchAllergyDeclaration = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllergyDeclaration(encounterId);
        if (!cancelled) {
          setData(response);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Error al obtener la declaración de alergias",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAllergyDeclaration();

    return () => {
      cancelled = true;
    };
  }, [encounterId, tick]);

  return { data, loading, error, refetch };
}
