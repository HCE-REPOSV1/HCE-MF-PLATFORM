export interface CatalogCie {
  cie_id:                   number;
  cie_uuid:                 string;
  cie_version:              string;
  cie_code:                 string;
  cie_description:          string;
  cie_description_search:   string;
  category_code:            string;
  applicable_sex:           string;
  min_age_value:            number;
  max_age_value:            number;
  age_unit:                 string;
  is_billable:              boolean;
  user_create:              string;
  user_modify:              string;
  date_create:              string;
  date_modify:              string;
  is_active:                boolean;
}

export interface CatalogCieResponse {
  success:  boolean;
  message:  string;
  data:     CatalogCie[];
}

export interface CatalogCodeSystemValue {
    value_id:       number,
    value_uuid:     string,
    code_system_id: number,
    code:           string,
    display_es:     string,
    display_en:     string,
    sort_order:     number,
    is_default:     boolean,
    metadata_json:  string | null,
    user_create:    string,
    user_modify:    string | null,
    date_create:    string,
    date_modify:    string | null,
    is_active:      boolean
}

export interface CatalogCodeSystemValueResponse {
  success:  boolean;
  message:  string;
  data:     CatalogCodeSystemValue[];
}

export interface CatalogActivePrinciples {
  active_principle_id: number,
  active_principle_uuid: string,
  atc_code: string,
  substance_name: string,
  substance_name_search: string,
  user_create: string,
  user_modify: string | null,
  date_create: string,
  date_modify: string | null,
  is_active: boolean
}

export interface CatalogActivePrinciplesResponse {
  success:  boolean;
  message:  string;
  data:     CatalogActivePrinciples[];
}

export interface CatalogIdentifierType {
  identifier_type_id:       number;
  identifier_type_uuid:     string;
  code:                     string;
  display_es:               string;
  display_en:               string;
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
  display_es:      string;
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