import { useState } from "react";
import { getTriageFull } from "../services/triage.service";
import type { TriageFullData } from "../types/triage.types";

export function useTriageFull() {
  const [data, setData] = useState<TriageFullData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTriageFull = async (
    triageId: string | number,
  ): Promise<TriageFullData | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTriageFull(triageId);
      setData(response);
      return response;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar el triaje",
      );
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchTriageFull, data, loading, error };
}
