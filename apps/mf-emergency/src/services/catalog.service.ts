/**
 * ---------------------------------------------------------
 * Service: catalog.service
 * Obtiene los datos del catalog.
 * Endpoints:
 * - GET catalogs/cie/search?text=${text}&column=${column}
 * - GET catalogs/code-system-values?code_system_id=${code_system_id}
 * - GET catalogs/active-principles
 * - GET catalogs/active-principles/search?text=${text}
 * - GET catalogs/identifier-types?entity_type=${entityType}
 * - GET catalogs/time-units
 * ---------------------------------------------------------
 */
import { ENDPOINTS } from "../config/endpoints";
import { apiFetch } from "shell/ApiClient";
import type {
  CatalogActivePrinciples,
  CatalogActivePrinciplesResponse,
  CatalogAgeGroup,
  CatalogAgeGroupResponse,
  CatalogIdentifierType,
  CatalogIdentifierTypeResponse,
  CatalogTimeUnit,
  CatalogTimeUnitResponse,
 
  
} from "../types/catalog.types";



export async function getActivePrinciples(): Promise<
  CatalogActivePrinciples[] | null
> {
  const res = await apiFetch(ENDPOINTS.catalogs.ActivePrinciples());
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(`Error ${res.status} al obtener datos del Catalog Cie`);

  const json = (await res.json()) as CatalogActivePrinciplesResponse;
  if (!json.success) return null;
  return json.data;
}

export async function getActivePrinciplesSearch(
  text: string,
): Promise<CatalogActivePrinciples[] | null> {
  const res = await apiFetch(ENDPOINTS.catalogs.ActivePrinciplesSearch(text));
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(
      `Error ${res.status} al buscar datos del Catalog Active Principles`,
    );

  const json = (await res.json()) as CatalogActivePrinciplesResponse;
  if (!json.success) return null;
  return json.data;
}


export async function getIdentifierTypes(
  entityType: string,
): Promise<CatalogIdentifierType[] | null> {
  const res = await apiFetch(ENDPOINTS.catalogs.IdentifierTypes(entityType));
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(
      `Error ${res.status} al obtener datos del Catalog Identifier Types`,
    );

  const json = (await res.json()) as CatalogIdentifierTypeResponse;
  if (!json.success) return null;
  return json.data;
}

export async function getTimeUnits(): Promise<CatalogTimeUnit[] | null> {
  const res = await apiFetch(ENDPOINTS.catalogs.TimeUnits());
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(
      `Error ${res.status} al obtener datos del Catalog Time Units`,
    );

  const json = (await res.json()) as CatalogTimeUnitResponse;
  if (!json.success) return null;
  return json.data;
}

export async function getAgeGroups(): Promise<CatalogAgeGroup[] | null> {
  const res = await apiFetch(ENDPOINTS.catalogs.AgeGroups());
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(
      `Error ${res.status} al obtener datos del Catalog Age Groups`,
    );

  const json = (await res.json()) as CatalogAgeGroupResponse;
  if (!json.success) return null;
  return json.data;
}
