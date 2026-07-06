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

export function useCatalog() {
  const [dataCatalogCie, setDataCatalogCie] = useState<CatalogCie[] | null>(null);
  const [dataCatalogCodeSystemValue, setDataCatalogCodeSystemValue] =
    useState<CatalogCodeSystemValue[] | null>(null);
  const [dataCatalogActivePrinciples, setDataCatalogActivePrinciples] = useState<CatalogActivePrinciples[] | null>(null);
  const [dataIdentifierTypes, setDataIdentifierTypes] = useState<CatalogIdentifierType[] | null>(null);
  const [dataTimeUnits, setDataTimeUnits] = useState<CatalogTimeUnit[] | null>(null);
  const [dataAgeGroups, setDataAgeGroups] = useState<CatalogAgeGroup[] | null>(null);
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

  const fetchCodeSystemValues = async (
    codeSystemId: string | number,
  ): Promise<CatalogCodeSystemValue[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCodeSystemValues(codeSystemId);
      setDataCatalogCodeSystemValue(response);
      return response;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar valores del catálogo",
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
    };

  const fetchCatalogActivePrinciplesSearch = async (
    text: string,
  ): Promise<CatalogActivePrinciples[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await getActivePrinciplesSearch(text);
      setDataCatalogActivePrinciples(response);
      return response;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al buscar principios activos",
      );
      setDataCatalogActivePrinciples(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchIdentifierTypes = async (
    entityType: string,
  ): Promise<CatalogIdentifierType[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await getIdentifierTypes(entityType);
      setDataIdentifierTypes(response);
      return response;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar tipos de documento",
      );
      setDataIdentifierTypes(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeUnits = async (): Promise<CatalogTimeUnit[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTimeUnits();
      setDataTimeUnits(response);
      return response;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar unidades de tiempo",
      );
      setDataTimeUnits(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchAgeGroups = async (): Promise<CatalogAgeGroup[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAgeGroups();
      setDataAgeGroups(response);
      return response;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar grupos etarios",
      );
      setDataAgeGroups(null);
      return null;
    } finally {
      setLoading(false);
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
    dataCatalogCie,
    dataCatalogCodeSystemValue,
    dataCatalogActivePrinciples,
    dataIdentifierTypes,
    dataTimeUnits,
    dataAgeGroups,
    loading,
    error,
  };
}
