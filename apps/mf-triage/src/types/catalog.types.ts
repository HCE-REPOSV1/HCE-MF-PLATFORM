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
    metadata_json:  string,
    user_create:    string,
    user_modify:    string,
    date_create:    string,
    date_modify:    string,
    is_active:      boolean
}

export interface CatalogCodeSystemValueResponse {
  success:  boolean;
  message:  string;
  data:     CatalogCodeSystemValue;
}

export interface CatalogActivePrinciples {
  active_principle_id: number,
  active_principle_uuid: string,
  atc_code: string,
  substance_name: string,
  substance_name_search: string,
  user_create: string,
  user_modify: string,
  date_create: string,
  date_modify: string,
  is_active: string
}

export interface CatalogActivePrinciplesResponse {
  success:  boolean;
  message:  string;
  data:     CatalogActivePrinciples[];
}