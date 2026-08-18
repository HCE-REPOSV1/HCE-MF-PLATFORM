import { useState } from "react";
import { postTriageForm } from "../services/triage.service";
import type { TriageFormRequest } from "../types/triage.types";

export function useTriage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createTriage = async (
    payload: TriageFormRequest,
  ): Promise<{ data: unknown | null; error: string | null }> => {
    setLoading(true);
    setError(null);
    try {
      const data = await postTriageForm(payload);
      return { data, error: null };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "errors.generic";

      setError(message);

      return {
        data: null,
        error: message,
      };
    } finally {
      setLoading(false);
    }
  };

  return { createTriage, loading, error };
}
