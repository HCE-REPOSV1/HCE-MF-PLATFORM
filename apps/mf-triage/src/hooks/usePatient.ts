import { useState } from "react";
import {
  getPatientByIdentifier,
  type Patient,
} from "../services/patient.service";

export function usePatient() {
  const [data, setData] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatient = async (
    idValue: string | null | undefined,
    idType: string | null | undefined,
  ): Promise<Patient | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPatientByIdentifier(idValue, idType);
      setData(response);
      return response;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar perfil del patient",
      );
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchPatient, data, loading, error };
}
