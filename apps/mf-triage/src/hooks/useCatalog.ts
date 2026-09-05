import { useCallback, useState } from "react";
import { i18n } from "@hce/i18n-core";
import {
  getCatalogCieSearch,
  getCodeSystemValues,
  getCodeSystemValuesByCode,
  getActivePrinciples,
  getActivePrinciplesSearch,
  getIdentifierTypes,
  getTimeUnits,
  getAgeGroups,
  getCatalogCieById,
} from "../services/catalog.service";
import type {
  CatalogActivePrinciples,
  CatalogAgeGroup,
  CatalogCie,
  CatalogCodeSystemValue,
  CatalogIdentifierType,
  CatalogTimeUnit,
} from "../types/catalog.types";
import { createCachedFetcher } from "../utils/createCachedFetcher";

// Cada recurso tiene su propio loading/error independiente — antes se compartía un único
// par de estados entre los 7 fetch, y como Triage.tsx los llama en paralelo con Promise.all,
// una llamada pisaba el loading/error de las demás (condición de carrera).
function useResourceState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  return { data, setData, loading, setLoading, error, setError };
}

// ⚠️ Fetchers cacheados a nivel de MÓDULO — nunca dentro de useCatalog(),
// o se recrean en cada render y se pierde el cache.

// Sin parámetros / catálogo completo: un solo fetcher fijo alcanza.
const activePrinciplesFetcher = createCachedFetcher(getActivePrinciples);
const timeUnitsFetcher = createCachedFetcher(getTimeUnits);
const ageGroupsFetcher = createCachedFetcher(getAgeGroups);

// Con parámetro variable: un fetcher POR cada valor distinto de la key.
const codeSystemFetchersById = new Map<
  number,
  ReturnType<typeof createCachedFetcher>
>();
function getCodeSystemFetcherById(codeSystemId: number) {
  if (!codeSystemFetchersById.has(codeSystemId)) {
    codeSystemFetchersById.set(
      codeSystemId,
      createCachedFetcher(() => getCodeSystemValues(codeSystemId)),
    );
  }
  return codeSystemFetchersById.get(codeSystemId)!;
}

const codeSystemFetchersByCode = new Map<
  string,
  ReturnType<typeof createCachedFetcher>
>();
function getCodeSystemFetcherByCode(codeSystemCode: string) {
  if (!codeSystemFetchersByCode.has(codeSystemCode)) {
    codeSystemFetchersByCode.set(
      codeSystemCode,
      createCachedFetcher(() => getCodeSystemValuesByCode(codeSystemCode)),
    );
  }
  return codeSystemFetchersByCode.get(codeSystemCode)!;
}

const identifierTypesFetchers = new Map<
  string,
  ReturnType<typeof createCachedFetcher>
>();
function getIdentifierTypesFetcher(entityType: string) {
  if (!identifierTypesFetchers.has(entityType)) {
    identifierTypesFetchers.set(
      entityType,
      createCachedFetcher(() => getIdentifierTypes(entityType)),
    );
  }
  return identifierTypesFetchers.get(entityType)!;
}

const catalogCieByIdFetchers = new Map<
  number,
  ReturnType<typeof createCachedFetcher>
>();
function getCatalogCieByIdFetcher(id: number) {
  if (!catalogCieByIdFetchers.has(id)) {
    catalogCieByIdFetchers.set(
      id,
      createCachedFetcher(() => getCatalogCieById(id)),
    );
  }
  return catalogCieByIdFetchers.get(id)!;
}

export function useCatalog() {
  const catalogCie = useResourceState<CatalogCie[]>();
  const catalogCieById = useResourceState<CatalogCie>();
  const catalogCodeSystemValue = useResourceState<CatalogCodeSystemValue[]>();
  const catalogActivePrinciples =
    useResourceState<CatalogActivePrinciples[]>();
  const identifierTypes = useResourceState<CatalogIdentifierType[]>();
  const timeUnits = useResourceState<CatalogTimeUnit[]>();
  const ageGroups = useResourceState<CatalogAgeGroup[]>();

  // Búsqueda por texto: NO se cachea (cada texto es una consulta distinta)
  const fetchCatalogCie = useCallback(
    async (text: string, column: string): Promise<CatalogCie[] | null> => {
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
    },
    [catalogCie.setData, catalogCie.setError, catalogCie.setLoading],
  );

  const fetchCatalogCieById = useCallback(
    async (id: number): Promise<CatalogCie | null> => {
      catalogCieById.setLoading(true);
      catalogCieById.setError(null);
      try {
        const response = await getCatalogCieByIdFetcher(id).fetch(
          i18n.language,
        );
        catalogCieById.setData(response as CatalogCie);
        return response as CatalogCie;
      } catch (err) {
        catalogCieById.setError(
          err instanceof Error
            ? err.message
            : "Error al cargar perfil del catalog cie por Id",
        );
        catalogCieById.setData(null);
        return null;
      } finally {
        catalogCieById.setLoading(false);
      }
    },
    [
      catalogCieById.setData,
      catalogCieById.setError,
      catalogCieById.setLoading,
    ],
  );

  const fetchCodeSystemValues = useCallback(
    async (codeSystemId: number): Promise<CatalogCodeSystemValue[] | null> => {
      catalogCodeSystemValue.setLoading(true);
      catalogCodeSystemValue.setError(null);
      try {
        const response = await getCodeSystemFetcherById(codeSystemId).fetch(
          i18n.language,
        );
        catalogCodeSystemValue.setData(response as CatalogCodeSystemValue[]);
        return response as CatalogCodeSystemValue[];
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
    },
    [
      catalogCodeSystemValue.setData,
      catalogCodeSystemValue.setError,
      catalogCodeSystemValue.setLoading,
    ],
  );

  // Preferida sobre fetchCodeSystemValues: recibe code_system_code (string
  // estable) en vez de code_system_id (IDENTITY no estable entre entornos).
  const fetchCodeSystemValuesByCode = useCallback(
    async (
      codeSystemCode: string,
    ): Promise<CatalogCodeSystemValue[] | null> => {
      catalogCodeSystemValue.setLoading(true);
      catalogCodeSystemValue.setError(null);
      try {
        const response = await getCodeSystemFetcherByCode(
          codeSystemCode,
        ).fetch(i18n.language);
        catalogCodeSystemValue.setData(response as CatalogCodeSystemValue[]);
        return response as CatalogCodeSystemValue[];
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
    },
    [
      catalogCodeSystemValue.setData,
      catalogCodeSystemValue.setError,
      catalogCodeSystemValue.setLoading,
    ],
  );

  const fetchCatalogActivePrinciples = useCallback(async (): Promise<
    CatalogActivePrinciples[] | null
  > => {
    catalogActivePrinciples.setLoading(true);
    catalogActivePrinciples.setError(null);
    try {
      const response = await activePrinciplesFetcher.fetch(i18n.language);
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

  // Búsqueda por texto: NO se cachea
  const fetchCatalogActivePrinciplesSearch = useCallback(
    async (text: string): Promise<CatalogActivePrinciples[] | null> => {
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
    },
    [
      catalogActivePrinciples.setData,
      catalogActivePrinciples.setError,
      catalogActivePrinciples.setLoading,
    ],
  );

  const fetchIdentifierTypes = useCallback(
    async (entityType: string): Promise<CatalogIdentifierType[] | null> => {
      identifierTypes.setLoading(true);
      identifierTypes.setError(null);
      try {
        const response = await getIdentifierTypesFetcher(entityType).fetch(
          i18n.language,
        );
        identifierTypes.setData(response as CatalogIdentifierType[]);
        return response as CatalogIdentifierType[];
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
    },
    [
      identifierTypes.setData,
      identifierTypes.setError,
      identifierTypes.setLoading,
    ],
  );

  const fetchTimeUnits = useCallback(async (): Promise<
    CatalogTimeUnit[] | null
  > => {
    timeUnits.setLoading(true);
    timeUnits.setError(null);
    try {
      const response = await timeUnitsFetcher.fetch(i18n.language);
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
  }, [timeUnits.setData, timeUnits.setError, timeUnits.setLoading]);

  const fetchAgeGroups = useCallback(async (): Promise<
    CatalogAgeGroup[] | null
  > => {
    ageGroups.setLoading(true);
    ageGroups.setError(null);
    try {
      const response = await ageGroupsFetcher.fetch(i18n.language);
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
  }, [ageGroups.setData, ageGroups.setError, ageGroups.setLoading]);

  return {
    fetchCatalogCie,
    fetchCatalogCieById,
    fetchCodeSystemValues,
    fetchCodeSystemValuesByCode,
    fetchCatalogActivePrinciples,
    fetchCatalogActivePrinciplesSearch,
    fetchIdentifierTypes,
    fetchTimeUnits,
    fetchAgeGroups,
    dataCatalogCie: catalogCie.data,
    dataCatalogCieById: catalogCieById.data,
    dataCatalogCodeSystemValue: catalogCodeSystemValue.data,
    dataCatalogActivePrinciples: catalogActivePrinciples.data,
    dataIdentifierTypes: identifierTypes.data,
    dataTimeUnits: timeUnits.data,
    dataAgeGroups: ageGroups.data,
    loadingCatalogCie: catalogCie.loading,
    errorCatalogCie: catalogCie.error,
    loadingCatalogCieById: catalogCieById.loading,
    errorCatalogCieById: catalogCieById.error,
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