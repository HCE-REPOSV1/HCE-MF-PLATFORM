export interface CatalogActivePrinciples {
  active_principle_id: number;
  active_principle_uuid: string;
  atc_code: string;
  substance_name: string;
  substance_name_search: string;
  user_create: string;
  user_modify: string | null;
  date_create: string;
  date_modify: string | null;
  is_active: boolean;
}

export interface CatalogActivePrinciplesResponse {
  success: boolean;
  message: string;
  data: CatalogActivePrinciples[];
}

export interface CatalogCompanionTypes {
  companion_type_id: number;
  companion_type_uuid: string;
  companion_type_name: string;
  description: string;
  display_order: number;
  user_create: string;
  user_modify: string | null;
  date_create: string;
  date_modify: string | null;
  is_active: boolean;
}

export interface CatalogCompanionTypesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: CatalogCompanionTypes[];
}

export interface CatalogBackgroundItem {
  background_catalog_id: number;
  background_catalog_uuid: string;
  background_category: "general" | "gyn_obstetric" | "pathological";
  background_name: string;
  background_name_search: string;
  display_order: number;
  user_create: string;
  user_modify: string | null;
  date_create: string;
  date_modify: string | null;
  is_active: boolean;
}

export interface CatalogBackgroundResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: CatalogBackgroundItem[];
}

export interface CatalogAdministrationRoutesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: CatalogAdministrationRoute[];
}
export interface CatalogAdministrationRoute {
  administration_route_id: number;
  administration_route_uuid: string;
  route_name: string;
  description: string;
  snomed_code: string | null;
  display_order: number;
  user_create: string;
  user_modify: string | null;
  date_create: string;
  date_modify: string | null;
  is_active: boolean;
}

export interface CatalogMedicationProduct {
  medication_legacy_code: string;
  medication_product_uuid: string;
  active_principle_id: number;
  pharmaceutical_form_id: number;
  strength_value: number;
  strength_unit: string;
  commercial_name: string | null;
  product_display: string;
  product_display_search: string;
  is_active: boolean;
}

export interface CatalogMedicationProductSearchResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: CatalogMedicationProduct[];
}

export interface CatalogCodeSystemValue {
  value_id: number;
  value_uuid: string;
  code_system_id: number;
  code: string;
  display: string;
  sort_order: number;
  is_default: boolean;
  metadata_json: unknown | null;
  user_create: string;
  user_modify: string | null;
  date_create: string;
  date_modify: string | null;
  is_active: boolean;
}

export interface CatalogCodeSystemValuesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: CatalogCodeSystemValue[];
}


export interface CatalogIdentifierType {
  identifier_type_id:       number;
  identifier_type_uuid:     string;
  code:                     string;
  /** Resuelto según Accept-Language (fallback a es). Reemplaza a los antiguos display_es/display_en. */
  display:                  string;
  entity_type:              string;
  requires_expiry:          boolean;
  is_reniec_verifiable:     boolean;
  is_unknown_patient_only:  boolean;
  sort_order:               number;
  user_create:              string;
  user_modify:              string | null;
  date_create:              string;
  date_modify:              string | null;
  is_active:                boolean;
}

export interface CatalogIdentifierTypeResponse {
  success:  boolean;
  message:  string;
  data:     CatalogIdentifierType[];
}

export interface CatalogTimeUnit {
  time_unit_id:    number;
  time_unit_uuid:  string;
  time_unit_code:  string;
  time_unit_name:  string;
  description:     string | null;
  display_order:   number;
  user_create:     string;
  user_modify:     string | null;
  date_create:     string;
  date_modify:     string | null;
  is_active:       boolean;
}

export interface CatalogTimeUnitResponse {
  success:  boolean;
  message:  string;
  data:     CatalogTimeUnit[];
}

export interface CatalogAgeGroup {
  age_group_id:    number;
  age_group_uuid:  string;
  code:            string;
  /** Resuelto según Accept-Language (fallback a es). Reemplaza al antiguo display_es (nunca hubo display_en real). */
  display:         string;
  description:     string | null;
  age_min_days:    number;
  age_max_days:    number | null;
  sort_order:      number;
  user_create:     string;
  user_modify:     string | null;
  date_create:     string;
  date_modify:     string | null;
  is_active:       boolean;
}

export interface CatalogAgeGroupResponse {
  success:  boolean;
  message:  string;
  data:     CatalogAgeGroup[];
}
