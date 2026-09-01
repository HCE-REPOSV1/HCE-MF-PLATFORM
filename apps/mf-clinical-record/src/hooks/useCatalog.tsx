import { useCallback, useState } from "react";
import {
  getActivePrinciples,
  getActivePrinciplesSearch,
  getAdministrationRoutes,
  getBackgroundCatalog,
  getCodeSystemValues,
  getCompanionTypes,
  searchMedicationProducts,
} from "../services/catalog.service";
import type {
  CatalogActivePrinciples,
  CatalogAdministrationRoute,
  CatalogBackgroundItem,
  CatalogCodeSystemValue,
  CatalogCompanionTypes,
  CatalogMedicationProduct,
} from "../types/Catalog.type";
import { createCachedFetcher } from "../utils/createCachedFetcher";

function useResourceState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  return { data, setData, loading, setLoading, error, setError };
}

// ⚠️ TODOS los fetchers cacheados van a nivel de MÓDULO, nunca dentro de
// useCatalog() — si no, se recrean en cada render y se pierde el cache
// (el mismo bug que ya resolvimos con companionTypesFetcher).
const companionTypesFetcher = createCachedFetcher(getCompanionTypes);
const backgroundCatalogFetcher = createCachedFetcher(getBackgroundCatalog);
const administrationRoutesFetcher = createCachedFetcher(getAdministrationRoutes);

// Un fetcher cacheado POR cada code_system_id distinto (Sueño, Apetito, etc.
// cada uno tiene su propio id, así que no pueden compartir un solo fetcher)
const codeSystemFetchers = new Map<number, ReturnType<typeof createCachedFetcher>>();
function getCodeSystemFetcher(codeSystemId: number) {
  if (!codeSystemFetchers.has(codeSystemId)) {
    codeSystemFetchers.set(
      codeSystemId,
      createCachedFetcher(() => getCodeSystemValues(codeSystemId)),
    );
  }
  return codeSystemFetchers.get(codeSystemId)!;
}

export function useCatalog() {
  const catalogActivePrinciples = useResourceState<CatalogActivePrinciples[]>();
  const catalogCompanionTypes = useResourceState<CatalogCompanionTypes[]>();
  const catalogBackground = useResourceState<CatalogBackgroundItem[]>();
  const catalogMedicationProducts = useResourceState<CatalogMedicationProduct[]>();
  const catalogAdministrationRoutes = useResourceState<CatalogAdministrationRoute[]>();
  const catalogCodeSystemValues = useResourceState<CatalogCodeSystemValue[]>();

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
  }, []);

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
    [],
  );

  const fetchCompanionTypes = useCallback(async (): Promise<
    CatalogCompanionTypes[] | null
  > => {
    catalogCompanionTypes.setLoading(true);
    catalogCompanionTypes.setError(null);
    try {
      const response = await companionTypesFetcher.fetch();
      catalogCompanionTypes.setData(response);
      return response;
    } catch (err) {
      catalogCompanionTypes.setError(
        err instanceof Error
          ? err.message
          : "Error al buscar tipos de compañias",
      );
      catalogCompanionTypes.setData(null);
      return null;
    } finally {
      catalogCompanionTypes.setLoading(false);
    }
  }, []);

  const fetchBackgroundCatalog = useCallback(async (): Promise<
    CatalogBackgroundItem[] | null
  > => {
    catalogBackground.setLoading(true);
    catalogBackground.setError(null);
    try {
      const response = await backgroundCatalogFetcher.fetch();
      catalogBackground.setData(response);
      return response;
    } catch (err) {
      catalogBackground.setError(
        err instanceof Error
          ? err.message
          : "Error al buscar catálogo de antecedentes",
      );
      catalogBackground.setData(null);
      return null;
    } finally {
      catalogBackground.setLoading(false);
    }
  }, []);

  const fetchAdministrationRoutes = useCallback(async (): Promise<
    CatalogAdministrationRoute[] | null
  > => {
    catalogAdministrationRoutes.setLoading(true);
    catalogAdministrationRoutes.setError(null);
    try {
      const response = await administrationRoutesFetcher.fetch();
      catalogAdministrationRoutes.setData(response);
      return response;
    } catch (err) {
      catalogAdministrationRoutes.setError(
        err instanceof Error
          ? err.message
          : "Error al buscar vías de administración",
      );
      catalogAdministrationRoutes.setData(null);
      return null;
    } finally {
      catalogAdministrationRoutes.setLoading(false);
    }
  }, []);

  const fetchMedicationProductsSearch = useCallback(
    async (text: string): Promise<CatalogMedicationProduct[] | null> => {
      catalogMedicationProducts.setLoading(true);
      catalogMedicationProducts.setError(null);
      try {
        const response = await searchMedicationProducts(text);
        catalogMedicationProducts.setData(response);
        return response;
      } catch (err) {
        catalogMedicationProducts.setError(
          err instanceof Error ? err.message : "Error al buscar medicamentos",
        );
        catalogMedicationProducts.setData(null);
        return null;
      } finally {
        catalogMedicationProducts.setLoading(false);
      }
    },
    [],
  );

  const fetchCodeSystemValues = useCallback(
    async (codeSystemId: number): Promise<CatalogCodeSystemValue[] | null> => {
      catalogCodeSystemValues.setLoading(true);
      catalogCodeSystemValues.setError(null);
      try {
        const response = await getCodeSystemFetcher(codeSystemId).fetch();
        catalogCodeSystemValues.setData(response as CatalogCodeSystemValue[]);
        return response as CatalogCodeSystemValue[];
      } catch (err) {
        catalogCodeSystemValues.setError(
          err instanceof Error
            ? err.message
            : "Error al buscar valores del catálogo",
        );
        catalogCodeSystemValues.setData(null);
        return null;
      } finally {
        catalogCodeSystemValues.setLoading(false);
      }
    },
    [],
  );

  return {
    fetchCatalogActivePrinciples,
    fetchCatalogActivePrinciplesSearch,
    fetchCompanionTypes,
    fetchBackgroundCatalog,
    fetchAdministrationRoutes,
    fetchMedicationProductsSearch,
    fetchCodeSystemValues,
    dataCatalogActivePrinciples: catalogActivePrinciples.data,
    loadingCatalogActivePrinciples: catalogActivePrinciples.loading,
    errorCatalogActivePrinciples: catalogActivePrinciples.error,
    dataCatalogCompanionTypes: catalogCompanionTypes.data,
    loadingCatalogCompanionTypes: catalogCompanionTypes.loading,
    errorCatalogCompanionTypes: catalogCompanionTypes.error,
    dataCatalogBackground: catalogBackground.data,
    loadingCatalogBackground: catalogBackground.loading,
    errorCatalogBackground: catalogBackground.error,
    dataCatalogAdministrationRoutes: catalogAdministrationRoutes.data,
    loadingCatalogAdministrationRoutes: catalogAdministrationRoutes.loading,
    errorCatalogAdministrationRoutes: catalogAdministrationRoutes.error,
    dataCatalogCodeSystemValues: catalogCodeSystemValues.data,
    loadingCatalogCodeSystemValues: catalogCodeSystemValues.loading,
    errorCatalogCodeSystemValues: catalogCodeSystemValues.error,
  };
}