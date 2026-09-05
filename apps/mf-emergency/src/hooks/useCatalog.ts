import { useCallback, useState } from "react";
import {
  getActivePrinciples,
  getActivePrinciplesSearch,
  getAgeGroups,
  getCodeSystemValues,
  getCodeSystemValuesByCode,
  getIdentifierTypes,
} from "../services/catalog.service";
import type {
  CatalogActivePrinciples,
  CatalogAgeGroup,
  CatalogCodeSystemValue,
  CatalogIdentifierType,
} from "../types/catalog.types";
import { createCachedFetcher } from "../utils/createCachedFetcher";
import { i18n } from "@hce/i18n-core";

function useResourceState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  return { data, setData, loading, setLoading, error, setError };
}

// ⚠️ Fetchers cacheados a nivel de MÓDULO — nunca dentro de useCatalog(),
// o se recrean en cada render y se pierde el cache.

// Sin parámetros: un solo fetcher fijo alcanza.
const activePrinciplesFetcher = createCachedFetcher(getActivePrinciples);
const ageGroupsFetcher = createCachedFetcher(getAgeGroups);

// Con parámetro variable: un fetcher POR cada valor distinto de la key,
// igual que ya hicimos con codeSystemFetchersByCode en mf-clinical-record.
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

export function useCatalog() {
  const catalogActivePrinciples =
    useResourceState<CatalogActivePrinciples[]>();
  const ageGroups = useResourceState<CatalogAgeGroup[]>();
  const identifierTypes = useResourceState<CatalogIdentifierType[]>();

  const catalogCodeSystemValue = useResourceState<CatalogCodeSystemValue[]>();
  const {
    setData: setCodeSystemData,
    setError: setCodeSystemError,
    setLoading: setCodeSystemLoading,
  } = catalogCodeSystemValue;

  const fetchCatalogActivePrinciples = useCallback(async (): Promise<
    CatalogActivePrinciples[] | null
  > => {
    catalogActivePrinciples.setLoading(true);
    catalogActivePrinciples.setError(null);
    try {
      const response = await activePrinciplesFetcher.fetch(i18n.language); // ⚠️ cacheado
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

  // Búsqueda por texto: NO se cachea (el texto cambia en cada tecla, cada
  // búsqueda es distinta) — mismo criterio que ya aplicamos en
  // fetchCatalogActivePrinciplesSearch de mf-clinical-record.
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

  const fetchAgeGroups = useCallback(async (): Promise<
    CatalogAgeGroup[] | null
  > => {
    ageGroups.setLoading(true);
    ageGroups.setError(null);
    try {
      const response = await ageGroupsFetcher.fetch(i18n.language); // ⚠️ cacheado
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

  const fetchIdentifierTypes = useCallback(
    async (entityType: string): Promise<CatalogIdentifierType[] | null> => {
      identifierTypes.setLoading(true);
      identifierTypes.setError(null);
      try {
        const response =
          await getIdentifierTypesFetcher(entityType).fetch(i18n.language); // ⚠️ cacheado por entityType
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

  const fetchCodeSystemValues = useCallback(
    async (codeSystemId: number): Promise<CatalogCodeSystemValue[] | null> => {
      setCodeSystemLoading(true);
      setCodeSystemError(null);
      try {
        const response =
          await getCodeSystemFetcherById(codeSystemId).fetch(i18n.language); // ⚠️ cacheado por id
        setCodeSystemData(response as CatalogCodeSystemValue[]);
        return response as CatalogCodeSystemValue[];
      } catch (err) {
        setCodeSystemError(
          err instanceof Error
            ? err.message
            : "Error al cargar valores del catálogo",
        );
        setCodeSystemData(null);
        return null;
      } finally {
        setCodeSystemLoading(false);
      }
    },
    [setCodeSystemData, setCodeSystemError, setCodeSystemLoading],
  );

  // Preferida sobre fetchCodeSystemValues: recibe code_system_code (string
  // estable) en vez de code_system_id (IDENTITY no estable entre entornos).
  const fetchCodeSystemValuesByCode = useCallback(
    async (codeSystemCode: string): Promise<CatalogCodeSystemValue[] | null> => {
      setCodeSystemLoading(true);
      setCodeSystemError(null);
      try {
        const response =
          await getCodeSystemFetcherByCode(codeSystemCode).fetch(i18n.language); // ⚠️ cacheado por code
        setCodeSystemData(response as CatalogCodeSystemValue[]);
        return response as CatalogCodeSystemValue[];
      } catch (err) {
        setCodeSystemError(
          err instanceof Error
            ? err.message
            : "Error al cargar valores del catálogo",
        );
        setCodeSystemData(null);
        return null;
      } finally {
        setCodeSystemLoading(false);
      }
    },
    [setCodeSystemData, setCodeSystemError, setCodeSystemLoading],
  );

  return {
    fetchAgeGroups,
    fetchCatalogActivePrinciples,
    fetchCatalogActivePrinciplesSearch,
    fetchIdentifierTypes,
    fetchCodeSystemValues,
    fetchCodeSystemValuesByCode,
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