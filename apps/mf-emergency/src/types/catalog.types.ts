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

