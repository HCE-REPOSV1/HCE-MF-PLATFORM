import { useCallback, useState } from "react";
import type { clinicalRecordApiData } from "../types/clinical.record.types";
import { getMedicalRecordTable } from "../services/medicalRecord.service";

function useResourceState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  return { data, setData, loading, setLoading, error, setError };
}
export function useClinicalRecordTable() {
  const clinicalRecordTable = useResourceState<clinicalRecordApiData[]>();
  const fetchClinicalRecordTable = useCallback(async (
    patientId: number,
    
  ): Promise<clinicalRecordApiData[] | null> => {
    try {
      const response = await getMedicalRecordTable(patientId);
      return response;
    } catch (err) {
      clinicalRecordTable.setError(
        err instanceof Error
          ? err.message
          : "Error al cargar perfil del catalog cie",
      );
      clinicalRecordTable.setData(null);
      return null;
    } finally {
      clinicalRecordTable.setLoading(false);
    }
  },[]);


  return {
    fetchClinicalRecordTable,
    dataClinicalRecordTable: clinicalRecordTable.data
  }
}
