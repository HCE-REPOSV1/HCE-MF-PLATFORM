/**
 * ---------------------------------------------------------
 * Service: catalog.service
 * Obtiene los datos del catalog.
 * Endpoints:
 * - GET catalogs/cie/search?text=${text}&column=${column}
 * - GET catalogs/code-system-values?code_system_id=${code_system_id}
 * ---------------------------------------------------------
 */
import { ENDPOINTS } from "../config/endpoints";
import { apiFetch } from "shell/ApiClient";
import type {
  CatalogActivePrinciples,
  CatalogActivePrinciplesResponse,
  CatalogCie,
  CatalogCieResponse,
  CatalogCodeSystemValue,
  CatalogCodeSystemValueResponse,
} from "../types/catalog.types";

export async function getCatalogCieSearch(
  text: string,
  column: string,
): Promise<CatalogCie[] | null> {
  const res = await apiFetch(ENDPOINTS.catalogs.CieSearch(text, column));
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(`Error ${res.status} al obtener datos del Catalog Cie`);

  const json = (await res.json()) as CatalogCieResponse;
  if (!json.success) return null;
  return json.data;
}

export async function getCatalogCodeSystemValue(): Promise<CatalogCodeSystemValue | null> {
  const res = await apiFetch(ENDPOINTS.catalogs.CodeSystemValue());
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(`Error ${res.status} al obtener datos del Catalog Cie`);

  const json = (await res.json()) as CatalogCodeSystemValueResponse;
  if (!json.success) return null;
  return json.data;
}

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
