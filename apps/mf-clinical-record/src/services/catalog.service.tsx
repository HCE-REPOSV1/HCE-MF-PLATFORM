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
import { apiFetch } from "shell/ApiClient";
import type {
  CatalogActivePrinciples,
  CatalogActivePrinciplesResponse,
  CatalogAdministrationRoute,
  CatalogAdministrationRoutesResponse,
  CatalogBackgroundItem,
  CatalogBackgroundResponse,
  CatalogCodeSystemValue,
  CatalogCodeSystemValuesResponse,
  CatalogCompanionTypes,
  CatalogCompanionTypesResponse,
  CatalogIdentifierType,
  CatalogIdentifierTypeResponse,
  CatalogMedicationProduct,
  CatalogMedicationProductSearchResponse,
  CatalogTimeUnit,
  CatalogTimeUnitResponse,
  CatalogAgeGroup,
  CatalogAgeGroupResponse,
} from "../types/Catalog.type";
import { ENDPOINTS } from "../config/endpoints";

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

export async function getCompanionTypes(): Promise<
  CatalogCompanionTypes[] | null
> {
  const res = await apiFetch(ENDPOINTS.catalogs.CompanionTypes());
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(
      `Error ${res.status} al buscar datos del Catalog Companion Types`,
    );

  const json = (await res.json()) as CatalogCompanionTypesResponse;
  if (!json.success) return null;
  return json.data;
}


export async function getBackgroundCatalog(): Promise<
  CatalogBackgroundItem[] | null
> {
  const res = await apiFetch(ENDPOINTS.catalogs.BackgroundCatalog());
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(
      `Error ${res.status} al obtener datos del Catalog Background`,
    );

  const json = (await res.json()) as CatalogBackgroundResponse;
  if (!json.success) return null;
  return json.data;
}

export async function getAdministrationRoutes(): Promise<
  CatalogAdministrationRoute[] | null
> {
  const res = await apiFetch(ENDPOINTS.catalogs.AdministrationRoutes());
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(
      `Error ${res.status} al obtener datos del Catalog Administration Routes`,
    );

  const json = (await res.json()) as CatalogAdministrationRoutesResponse;
  if (!json.success) return null;
  return json.data;
}

export async function searchMedicationProducts(
  text: string,
): Promise<CatalogMedicationProduct[] | null> {
  const res = await apiFetch(ENDPOINTS.catalogs.MedicationProductsSearch(text));
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(`Error ${res.status} al buscar productos medicamentosos`);

  const json = (await res.json()) as CatalogMedicationProductSearchResponse;
  if (!json.success) return null;
  return json.data;
}

export async function getCodeSystemValues(
  codeSystemId: number,
): Promise<CatalogCodeSystemValue[] | null> {
  const res = await apiFetch(ENDPOINTS.catalogs.CodeSystemValues(codeSystemId));
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(`Error ${res.status} al obtener valores de code system`);

  const json = (await res.json()) as CatalogCodeSystemValuesResponse;
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
