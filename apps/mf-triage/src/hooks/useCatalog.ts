import { useState } from "react";
import {
  getCatalogCieSearch,
  getCatalogCodeSystemValue,
  getActivePrinciples
} from "../services/catalog.service";
import type {
  CatalogActivePrinciples,
  CatalogCie,
  CatalogCodeSystemValue,
} from "../types/catalog.types";

export function useCatalog() {
  const [dataCatalogCie, setDataCatalogCie] = useState<CatalogCie[] | null>(null);
  const [dataCatalogCodeSystemValue, setDataCatalogCodeSystemValue] =
    useState<CatalogCodeSystemValue | null>(null);
  const [dataCatalogActivePrinciples, setDataCatalogActivePrinciples] = useState<CatalogActivePrinciples[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalogCie = async (
    text: string,
    column: string,
  ): Promise<CatalogCie[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCatalogCieSearch(text, column);
      setDataCatalogCie(response);
      return response;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar perfil del catalog cie",
      );
      setDataCatalogCie(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogCodeSystemValue =
    async (): Promise<CatalogCodeSystemValue | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await getCatalogCodeSystemValue();
        setDataCatalogCodeSystemValue(response);
        return response;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar perfil del catalog cie",
        );
        setDataCatalogCodeSystemValue(null);
        return null;
      } finally {
        setLoading(false);
      }
    };

    const fetchCatalogActivePrinciples =
    async (): Promise<CatalogActivePrinciples[] | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await getActivePrinciples();
        setDataCatalogActivePrinciples(response);
        return response;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar perfil del catalog cie",
        );
        setDataCatalogActivePrinciples(null);
        return null;
      } finally {
        setLoading(false);
      }
    }

  return {
    fetchCatalogCie,
    fetchCatalogCodeSystemValue,
    fetchCatalogActivePrinciples,
    dataCatalogCie,
    dataCatalogCodeSystemValue,
    dataCatalogActivePrinciples,
    loading,
    error,
  };
}
