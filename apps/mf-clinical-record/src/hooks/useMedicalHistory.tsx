import { useCallback, useState } from "react";
import type { medicalHistoryApiData } from "../types/MedicalHistory";
import { getMedicalHistory } from "../services/medicalHistory.service";

function useResourceState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  return { data, setData, loading, setLoading, error, setError };
}

export function useMedicalHistory() {
  const medicalHistoryTable = useResourceState<medicalHistoryApiData[]>();
  const fetchMedicalHistory = useCallback(
    async (patientId: number): Promise<medicalHistoryApiData[] | null> => {
      try {
        const response = await getMedicalHistory(patientId);
        return response;
      } catch (err) {
        medicalHistoryTable.setError(
          err instanceof Error
            ? err.message
            : "Error al cargar perfil del catalog cie",
        );
        medicalHistoryTable.setData(null);
        return null;
      } finally {
        medicalHistoryTable.setLoading(false);
      }
    },
    [],
  );

   return {
    fetchMedicalHistory,
    dataMedicalHistory: medicalHistoryTable.data
  }
}
