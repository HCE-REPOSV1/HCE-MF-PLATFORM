import { useState } from "react";
import {
  getCatalogCieSearch,
  getCodeSystemValues,
  getActivePrinciples,
  getActivePrinciplesSearch,
  getIdentifierTypes,
  getTimeUnits,
  getAgeGroups,
} from "../services/catalog.service";
import type {
  CatalogActivePrinciples,
  CatalogAgeGroup,
  CatalogCie,
  CatalogCodeSystemValue,
  CatalogIdentifierType,
  CatalogTimeUnit,
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
  const catalogCie = useResourceState<CatalogCie[]>();
  const catalogCodeSystemValue = useResourceState<CatalogCodeSystemValue[]>();
  const catalogActivePrinciples = useResourceState<CatalogActivePrinciples[]>();
  const identifierTypes = useResourceState<CatalogIdentifierType[]>();
  const timeUnits = useResourceState<CatalogTimeUnit[]>();
  const ageGroups = useResourceState<CatalogAgeGroup[]>();

  const fetchCatalogCie = async (
    text: string,
    column: string,
  ): Promise<CatalogCie[] | null> => {
    catalogCie.setLoading(true);
    catalogCie.setError(null);
    try {
      const response = await getCatalogCieSearch(text, column);
      catalogCie.setData(response);
      return response;
    } catch (err) {
      catalogCie.setError(
        err instanceof Error
          ? err.message
          : "Error al cargar perfil del catalog cie",
      );
      catalogCie.setData(null);
      return null;
    } finally {
      catalogCie.setLoading(false);
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

  const fetchCatalogActivePrinciples =
    async (): Promise<CatalogActivePrinciples[] | null> => {
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

  const fetchTimeUnits = async (): Promise<CatalogTimeUnit[] | null> => {
    timeUnits.setLoading(true);
    timeUnits.setError(null);
    try {
      const response = await getTimeUnits();
      timeUnits.setData(response);
      return response;
    } catch (err) {
      timeUnits.setError(
        err instanceof Error
          ? err.message
          : "Error al cargar unidades de tiempo",
      );
      timeUnits.setData(null);
      return null;
    } finally {
      timeUnits.setLoading(false);
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
        err instanceof Error
          ? err.message
          : "Error al cargar grupos etarios",
      );
      ageGroups.setData(null);
      return null;
    } finally {
      ageGroups.setLoading(false);
    }
  };

  return {
    fetchCatalogCie,
    fetchCodeSystemValues,
    fetchCatalogActivePrinciples,
    fetchCatalogActivePrinciplesSearch,
    fetchIdentifierTypes,
    fetchTimeUnits,
    fetchAgeGroups,
    dataCatalogCie: catalogCie.data,
    dataCatalogCodeSystemValue: catalogCodeSystemValue.data,
    dataCatalogActivePrinciples: catalogActivePrinciples.data,
    dataIdentifierTypes: identifierTypes.data,
    dataTimeUnits: timeUnits.data,
    dataAgeGroups: ageGroups.data,
    loadingCatalogCie: catalogCie.loading,
    errorCatalogCie: catalogCie.error,
    loadingCodeSystemValues: catalogCodeSystemValue.loading,
    errorCodeSystemValues: catalogCodeSystemValue.error,
    loadingCatalogActivePrinciples: catalogActivePrinciples.loading,
    errorCatalogActivePrinciples: catalogActivePrinciples.error,
    loadingIdentifierTypes: identifierTypes.loading,
    errorIdentifierTypes: identifierTypes.error,
    loadingTimeUnits: timeUnits.loading,
    errorTimeUnits: timeUnits.error,
    loadingAgeGroups: ageGroups.loading,
    errorAgeGroups: ageGroups.error,
  };
}
