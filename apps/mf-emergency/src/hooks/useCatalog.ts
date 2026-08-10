import { useState } from "react";
import {
  getActivePrinciples,
  getActivePrinciplesSearch,
  
} from "../services/catalog.service";
import type {
  CatalogActivePrinciples,
} from "../types/catalog.types";

// Cada recurso tiene su propio loading/error independiente — antes se compartía un único
// par de estados entre los 7 fetch, y como Triage.tsx los llama en paralelo con Promise.all,
// una llamada pisaba el loading/error de las demás (condición de carrera).
function useResourceState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  return { data, setData, loading, setLoading, error, setError };
}

export function useCatalog() {
  
  const catalogActivePrinciples = useResourceState<CatalogActivePrinciples[]>();
 

  const fetchCatalogActivePrinciples = async (): Promise<
    CatalogActivePrinciples[] | null
  > => {
    catalogActivePrinciples.setLoading(true);
    catalogActivePrinciples.setError(null);
    try {
      const response = await getActivePrinciples();
      catalogActivePrinciples.setData(response);
      return response;
    } catch (err) {
      catalogActivePrinciples.setError(
        err instanceof Error
          ? err.message
          : "Error al cargar perfil del catalog cie",
      );
      catalogActivePrinciples.setData(null);
      return null;
    } finally {
      catalogActivePrinciples.setLoading(false);
    }
  };

  const fetchCatalogActivePrinciplesSearch = async (
    text: string,
  ): Promise<CatalogActivePrinciples[] | null> => {
    catalogActivePrinciples.setLoading(true);
    catalogActivePrinciples.setError(null);
    try {
      const response = await getActivePrinciplesSearch(text);
      catalogActivePrinciples.setData(response);
      return response;
    } catch (err) {
      catalogActivePrinciples.setError(
        err instanceof Error
          ? err.message
          : "Error al buscar principios activos",
      );
      catalogActivePrinciples.setData(null);
      return null;
    } finally {
      catalogActivePrinciples.setLoading(false);
    }
  };


  return {
   
    fetchCatalogActivePrinciples,
    fetchCatalogActivePrinciplesSearch,
    dataCatalogActivePrinciples: catalogActivePrinciples.data,  
    loadingCatalogActivePrinciples: catalogActivePrinciples.loading,
    errorCatalogActivePrinciples: catalogActivePrinciples.error,
  };
}
