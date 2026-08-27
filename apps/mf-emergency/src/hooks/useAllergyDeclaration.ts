import { useCallback, useEffect, useState } from "react";
import { ENDPOINTS } from "../config/endpoints";
import { ApiError, type ApiErrorCode } from "../i18n/errorCodes";

export interface AllergySubstances {
  allergy_substance_id: number;
  active_principle_id: number;
  active_principle_name?:string
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

export interface AllergyDeclaration {
  encounter_id: number;
  has_triage: string;
  has_declaration: string;
  declaration: Declaration | null;
}

interface AllergyDeclarationResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AllergyDeclaration;
}

export interface UseAllergyDeclarationResult {
  data: AllergyDeclaration | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UpdateAllergyDeclarationRequest {
  has_allergies: "S" | "N";
  food_allergies: string | null;
  other_allergies: string | null;
  active_principle_ids: number[],
  user_modify: string;

}

export async function updateAllergyDeclaration(
  encounterId: number,
  declaration: UpdateAllergyDeclarationRequest,
): Promise<AllergyDeclaration | Declaration | null> {
  const response = await fetch(
    ENDPOINTS.encounter.updateAllergy(encounterId),
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(declaration),
    },
  );

  const payload = await response.json().catch(() => null) as
    | {
        codigo?: ApiErrorCode;
        code?: ApiErrorCode;
        statusCode?: number;
        data?: AllergyDeclaration | Declaration;
      }
    | null;

  if (!response.ok) {
    throw new ApiError(
      payload?.codigo ?? payload?.code ?? payload?.statusCode,
      response.status,
    );
  }

  return payload?.data ?? null;
}








export function useAllergyDeclaration(
  encounterId?: number,
): UseAllergyDeclarationResult {
  const [data, setData] = useState<AllergyDeclaration | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllergyDeclaration = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      if (!encounterId) {
        setData(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          ENDPOINTS.encounter.allergyInfo(encounterId),
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal,
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload: AllergyDeclarationResponse =
          await response.json();

        if (!signal?.aborted) {
          setData(payload.data);
        }
      } catch (err: unknown) {
        // Si se desmontó el componente, no lo consideramos error
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "Error al obtener la información del paciente";

        if (!signal?.aborted) {
          setError(message);
        }

        // Importante para que await refetch() pueda entrar al catch
        throw err;
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [encounterId],
  );

  // Carga inicial / cambio de encounter
  useEffect(() => {
    const controller = new AbortController();

    void fetchAllergyDeclaration(controller.signal).catch(() => {
      // El error ya se guarda en `error`
    });

    return () => {
      controller.abort();
    };
  }, [fetchAllergyDeclaration]);

  // Refetch manual que SÍ se puede esperar
  const refetch = useCallback(async (): Promise<void> => {
    await fetchAllergyDeclaration();
  }, [fetchAllergyDeclaration]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
