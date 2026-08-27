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

  const fetchAllergyDeclaration = useCallback(async (): Promise<void> => {
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
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload: AllergyDeclarationResponse =
        await response.json();

      setData(payload.data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al obtener la declaración de alergias";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [encounterId]);

  useEffect(() => {
    if (!encounterId) return;

    void fetchAllergyDeclaration().catch(() => {
      // El error ya se guarda dentro del hook
    });
  }, [encounterId, fetchAllergyDeclaration]);

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