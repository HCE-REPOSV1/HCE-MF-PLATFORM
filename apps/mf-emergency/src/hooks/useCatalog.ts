import { useCallback, useState } from "react";
import {
  getActivePrinciples,
  getActivePrinciplesSearch,
  getAgeGroups,
  getCodeSystemValues,
  getIdentifierTypes,
  
} from "../services/catalog.service";
import type {
  CatalogActivePrinciples,
  CatalogAgeGroup,
  CatalogCodeSystemValue,
  CatalogIdentifierType,
} from "../types/catalog.types";

// Estado de loading/error/data de un recurso de catálogo. Nota: fetchCatalogActivePrinciples
// y fetchCatalogActivePrinciplesSearch comparten la misma instancia (catalogActivePrinciples)
// — si en el futuro se llaman en paralelo, se pisarán el loading/error entre sí. Si eso llega
// a pasar, dales cada uno su propio useResourceState().
function useResourceState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  return { data, setData, loading, setLoading, error, setError };
}

export function useCatalog() {
  
  const catalogActivePrinciples = useResourceState<CatalogActivePrinciples[]>();
    const ageGroups = useResourceState<CatalogAgeGroup[]>();
     const identifierTypes = useResourceState<CatalogIdentifierType[]>();
     
  const catalogCodeSystemValue = useResourceState<CatalogCodeSystemValue[]>();
 

  const fetchCatalogActivePrinciples = useCallback(async (): Promise<
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
  }, [
    catalogActivePrinciples.setData,
    catalogActivePrinciples.setError,
    catalogActivePrinciples.setLoading,
  ]);

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

   const fetchAgeGroups = async (): Promise<CatalogAgeGroup[] | null> => {
    ageGroups.setLoading(true);
    ageGroups.setError(null);
    try {
      const response = await getAgeGroups();
      ageGroups.setData(response);
      return response;
    } catch (err) {
      ageGroups.setError(
        err instanceof Error ? err.message : "Error al cargar grupos etarios",
      );
      ageGroups.setData(null);
      return null;
    } finally {
      ageGroups.setLoading(false);
    }
  };

   const fetchIdentifierTypes = async (
    entityType: string,
  ): Promise<CatalogIdentifierType[] | null> => {
    identifierTypes.setLoading(true);
    identifierTypes.setError(null);
    try {
      const response = await getIdentifierTypes(entityType);
      identifierTypes.setData(response);
      return response;
    } catch (err) {
      identifierTypes.setError(
        err instanceof Error
          ? err.message
          : "Error al cargar tipos de documento",
      );
      identifierTypes.setData(null);
      return null;
    } finally {
      identifierTypes.setLoading(false);
    }
  };

   const fetchCodeSystemValues = async (
    codeSystemId: string | number,
  ): Promise<CatalogCodeSystemValue[] | null> => {
    catalogCodeSystemValue.setLoading(true);
    catalogCodeSystemValue.setError(null);
    try {
      const response = await getCodeSystemValues(codeSystemId);
      catalogCodeSystemValue.setData(response);
      return response;
    } catch (err) {
      catalogCodeSystemValue.setError(
        err instanceof Error
          ? err.message
          : "Error al cargar valores del catálogo",
      );
      catalogCodeSystemValue.setData(null);
      return null;
    } finally {
      catalogCodeSystemValue.setLoading(false);
    }
  };

  return {
    fetchAgeGroups,
    fetchCatalogActivePrinciples,
    fetchCatalogActivePrinciplesSearch,
    fetchIdentifierTypes,
    fetchCodeSystemValues,
    dataCatalogActivePrinciples: catalogActivePrinciples.data,  
    loadingCatalogActivePrinciples: catalogActivePrinciples.loading,
    errorCatalogActivePrinciples: catalogActivePrinciples.error,
    dataCatalogCodeSystemValue: catalogCodeSystemValue.data,
    loadingCodeSystemValues: catalogCodeSystemValue.loading,
    errorCodeSystemValues: catalogCodeSystemValue.error,
    dataAgeGroups: ageGroups.data,
    loadingAgeGroups: ageGroups.loading,
    errorAgeGroups: ageGroups.error,
     dataIdentifierTypes: identifierTypes.data,
      loadingIdentifierTypes: identifierTypes.loading,
    errorIdentifierTypes: identifierTypes.error,
  };
}
