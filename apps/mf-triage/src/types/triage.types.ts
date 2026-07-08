/**
 * ---------------------------------------------------------
 * Types: triage.types
 * Contrato real del formulario de triaje enviado al backend.
 * Endpoint: POST /api/v1/triage/form (orquestador ms-cnl-web-hce-triage,
 * reenvía a ms-bs-core-triage).
 *
 * Reglas confirmadas contra el código fuente del backend:
 * - `triage` es el único sub-objeto obligatorio.
 * - `vitalSign` / `glasgowScale` / `fastScale` son opcionales a nivel de
 *   clave raíz — si no hay datos para una sección, se debe OMITIR la clave
 *   por completo (no enviar `"vitalSign": null`). Dentro de cada uno, el
 *   único campo obligatorio es `user_create`.
 * - `patient_id` es obligatorio salvo en el caso de paciente NN, donde se
 *   omite (o se envía `null`) y se agrega `unidentified_patient` con
 *   `gender` + `estimated_age_group` — el orquestador crea el paciente NN,
 *   obtiene su patient_id real y lo inyecta antes de continuar.
 * ---------------------------------------------------------
 */

export type Gender = "male" | "female" | "other" | "unknown";

export type EstimatedAgeGroup =
  | "NEONATO"
  | "LACTANTE"
  | "PREESCOLAR"
  | "ESCOLAR"
  | "ADOLESCENTE"
  | "ADULTO_JOVEN"
  | "ADULTO"
  | "ADULTO_MAYOR";

// El valor real que valida el backend es exactamente time_unit_name del catálogo remoto
// (CatalogTimeUnit) — no se traduce ni se hardcodea, así que no hay un union type conocido
// de antemano que lo represente con seguridad.
export type IllnessDurationUnit = string;

export interface TriageData {
  patient_id?:              number | null;
  location_id:              number;
  encounter_id?:            number;
  practitioner_id?:         number;
  cie_id?:                  number;
  chief_complaint_code?:    number;
  comments?:                string;
  isolation_required?:      boolean;
  is_pregnant?:             boolean;
  fur_enabled?:             boolean;
  fur_date?:                string;
  illness_duration?:        number;
  illness_duration_unit?:   IllnessDurationUnit;
  pain_scale_eva?:          number;
  triage_level?:            number;
  triage_level_suggested?:  number;
  triage_datetime?:         string;
  user_create:              string;
}

export interface UnidentifiedPatientData {
  gender:                Gender;
  estimated_age_group:   EstimatedAgeGroup;
}

export interface VitalSignData {
  trauma_shock_flag?:        boolean;
  impossible_capture_flag?:  boolean;
  weight_kg?:                 number;
  height_cm?:                 number;
  systolic_pressure?:        number;
  diastolic_pressure?:       number;
  heart_rate?:               number;
  respiratory_rate?:         number;
  oxygen_saturation?:        number;
  temperature_c?:            number;
  measured_at?:              string;
  user_create:               string;
}

export interface GlasgowScaleData {
  ocular_response?:  number;
  verbal_response?:  number;
  motor_response?:   number;
  measured_at?:      string;
  user_create:       string;
}

export interface FastScaleData {
  face_flag?:    boolean;
  arm_flag?:     boolean;
  speech_flag?:  boolean;
  time_flag?:    boolean;
  measured_at?:  string;
  user_create:   string;
}

export interface AllergyIntoleranceData {
  has_allergies:     "S" | "N";
  food_allergies?:   string;
  other_allergies?:  string;
  user_create:       string;
}

export interface AllergySubstanceData {
  active_principle_id: number;
}

export interface TriageFormRequest {
  triage:                TriageData;
  unidentified_patient?: UnidentifiedPatientData;
  vitalSign?:            VitalSignData;
  glasgowScale?:         GlasgowScaleData;
  fastScale?:            FastScaleData;
  allergyIntolerance?:   AllergyIntoleranceData;
  allergySubstances?:    AllergySubstanceData[];
}

export interface TriageFormResponse {
  success:     boolean;
  statusCode:  number;
  message:     string;
  data:        unknown;
}
