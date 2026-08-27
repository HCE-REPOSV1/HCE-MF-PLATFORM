import { useState } from "react";
import { getActivePrinciples, getActivePrinciplesSearch } from "../services/catalog.service";
import type { CatalogActivePrinciples } from "../types/Catalog.type";

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
