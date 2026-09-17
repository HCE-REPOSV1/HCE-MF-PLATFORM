// hooks/useDiagnosis.tsx
import { useCallback, useState } from "react";
import type {
  DiagnosisApiItem,
  NewDiagnosisPayload,
} from "../types/Diagnosis.type";
import {
  createDiagnosis,
  getDiagnosesByEncounter,
  setDiagnosisActive,
} from "../services/diagnosis.service";

function useResourceState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  return { data, setData, loading, setLoading, error, setError };
}

export function useDiagnosis() {
  const diagnoses = useResourceState<DiagnosisApiItem[]>();
  const [creating, setCreating] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  const fetchDiagnosesByEncounter = useCallback(
    async (encounterId: number): Promise<DiagnosisApiItem[] | null> => {
      diagnoses.setLoading(true);
      diagnoses.setError(null);
      try {
        const response = await getDiagnosesByEncounter(encounterId);
        diagnoses.setData(response);
        return response;
      } catch (err) {
        diagnoses.setError(
          err instanceof Error
            ? err.message
            : "Error al cargar los diagnósticos de la atención",
        );
        diagnoses.setData(null);
        return null;
      } finally {
        diagnoses.setLoading(false);
      }
    },
    [],
  );

  const addDiagnosis = useCallback(
    async (payload: NewDiagnosisPayload): Promise<boolean> => {
      setCreating(true);
      try {
        await createDiagnosis(payload);
        return true;
      } catch (err) {
        diagnoses.setError(
          err instanceof Error
            ? err.message
            : "Error al registrar el diagnóstico",
        );
        return false;
      } finally {
        setCreating(false);
      }
    },
    [],
  );

  const deactivateDiagnosis = useCallback(
    async (diagnosisId: number, userModify: string): Promise<boolean> => {
      setUpdatingStatusId(diagnosisId);
      try {
        await setDiagnosisActive(diagnosisId, false, userModify);
        return true;
      } catch (err) {
        diagnoses.setError(
          err instanceof Error
            ? err.message
            : "Error al eliminar el diagnóstico",
        );
        return false;
      } finally {
        setUpdatingStatusId(null);
      }
    },
    [],
  );

  return {
    fetchDiagnosesByEncounter,
    dataDiagnoses: diagnoses.data,
    loadingDiagnoses: diagnoses.loading,
    errorDiagnoses: diagnoses.error,

    addDiagnosis,
    creatingDiagnosis: creating,

    deactivateDiagnosis,
    updatingStatusDiagnosisId: updatingStatusId,
  };
}
