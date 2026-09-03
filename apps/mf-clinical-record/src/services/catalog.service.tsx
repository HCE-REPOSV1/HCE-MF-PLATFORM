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

const USE_MOCK_MEDICATION_SEARCH = true;

const MOCK_MEDICATION_PRODUCTS: CatalogMedicationProduct[] = [
  {
    medication_legacy_code: "LOG-000123",
    medication_product_uuid: "163534BC-359B-F111-95E5-00155D856407",
    active_principle_id: 1,
    pharmaceutical_form_id: 1,
    strength_value: 500,
    strength_unit: "mg",
    commercial_name: null,
    product_display: "Paracetamol 500mg Tableta",
    product_display_search: "paracetamol acetaminofen 500mg tableta",
    is_active: true,
  },
  {
    medication_legacy_code: "LOG-000456",
    medication_product_uuid: "273645CD-460C-F222-96F6-00266E967518",
    active_principle_id: 2,
    pharmaceutical_form_id: 3,
    strength_value: 250,
    strength_unit: "mg",
    commercial_name: "Amoxil",
    product_display: "Amoxicilina 250mg Cápsula",
    product_display_search: "amoxicilina 250mg capsula",
    is_active: true,
  },
  {
    medication_legacy_code: "LOG-000789",
    medication_product_uuid: "384756DE-571D-F333-97G7-00377F078629",
    active_principle_id: 3,
    pharmaceutical_form_id: 2,
    strength_value: 100,
    strength_unit: "mg",
    commercial_name: null,
    product_display: "Ibuprofeno 100mg Jarabe",
    product_display_search: "ibuprofeno 100mg jarabe",
    is_active: true,
  },
];

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
  if (USE_MOCK_MEDICATION_SEARCH) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const query = text.trim().toLowerCase();
    if (!query) return MOCK_MEDICATION_PRODUCTS;
    return MOCK_MEDICATION_PRODUCTS.filter((item) =>
      item.product_display_search.includes(query),
    );
  }

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
