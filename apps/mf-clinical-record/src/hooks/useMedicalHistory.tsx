import { useCallback, useState } from "react";
import type {
  medicalHistoryApiData,
  medicalHistoryApiMeta,
  medicalHistoryApiResponse,
} from "../types/MedicalHistory";
import { getMedicalHistory } from "../services/medicalHistory.service";

function useResourceState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  return { data, setData, loading, setLoading, error, setError };
}

export function useMedicalHistory() {
  const medicalHistoryTable = useResourceState<medicalHistoryApiData[]>();
  const [meta, setMeta] = useState<medicalHistoryApiMeta | null>(null);
  const fetchMedicalHistory = useCallback(
    async (
      patientId: number,
      page = 1,
      limit = 20,
    ): Promise<medicalHistoryApiResponse | null> => {
      medicalHistoryTable.setLoading(true);
      medicalHistoryTable.setError(null);
      try {
        const response = await getMedicalHistory(patientId, page, limit);
        medicalHistoryTable.setData(response?.data ?? null);
        setMeta(response?.meta ?? null);
        return response;
      } catch (err) {
        medicalHistoryTable.setError(
          err instanceof Error
            ? err.message
            : "Error al cargar perfil del historia de paciente",
        );
        medicalHistoryTable.setData(null);
        setMeta(null);
        return null;
      } finally {
        medicalHistoryTable.setLoading(false);
      }
    },
    [],
  );

  return {
    fetchMedicalHistory,
    dataMedicalHistory: medicalHistoryTable.data,
    metaMedicalHistory: meta,
    loadingMedicalHistory: medicalHistoryTable.loading,
    errorMedicalHistory: medicalHistoryTable.error,
  };
}
