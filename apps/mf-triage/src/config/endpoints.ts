/**
 * ---------------------------------------------------------
 * Endpoints centralizados — mf-triage
 * Fuente única de verdad para las URLs del practitioner.
 * Toda URL se lee de variables de entorno (.env).
 * Si falta una variable obligatoria, el build falla en startup.
 * ---------------------------------------------------------
 */

const AG_WEB_EMERGENCY = import.meta.env.VITE_APIGW_WEB_EMERGENCY;

const AG_CLN_CROSS = import.meta.env.VITE_APIGW_CLN_CROSS;

// code_system_id de catálogos genéricos (tabla code-system-values)
export const CSI_INPUT_TIPO_MOTIVO = import.meta.env.VITE_CSI_INPUT_TIPO_MOTIVO;
export const CSI_GENDER = import.meta.env.VITE_CSI_GENDER;

if (!AG_WEB_EMERGENCY)
  throw new Error(
    "[mf-triage] VITE_APIGW_WEB_EMERGENCY no está configurado",
  );
if (!AG_CLN_CROSS)
  throw new Error("[mf-triage] VITE_APIGW_CLN_CROSS no está configurado");
if (!CSI_GENDER)
  throw new Error("[mf-triage] VITE_CSI_GENDER no está configurado");

export const ENDPOINTS = {
  patients: {
    ByIdentifier: (
      idValue: string | null | undefined,
      idType: string | null | undefined,
    ) =>
      `${AG_WEB_EMERGENCY}/api/v1/patient/by-identifier?identifier_value=${encodeURIComponent(idValue ?? "")}&identifier_type=${encodeURIComponent(idType ?? "")}`,
  },
  triage: {
    CreateForm: () => `${AG_WEB_EMERGENCY}/api/v1/triage/form`,
    /** Triaje completo (triage + vitalSign + glasgowScale + fastScale + patient + declaratoria de alergia). */
    Full: (triageId: string | number) => `${AG_WEB_EMERGENCY}/api/v1/triage/${triageId}/full`,
  },
  catalogs: {
    CieSearch: (text: string, column: string) =>
      `${AG_CLN_CROSS}/api/v1/catalogs/cie/search?text=${encodeURIComponent(text)}&column=${encodeURIComponent(column)}`,
    // Catálogo genérico de valores predeterminados del sistema (tabla code-system-values)
    CodeSystemValues: (codeSystemId: string | number) =>
      `${AG_CLN_CROSS}/api/v1/catalogs/code-system-values?code_system_id=${codeSystemId}`,
    ActivePrinciples: () => `${AG_CLN_CROSS}/api/v1/catalogs/active-principles`,
    ActivePrinciplesSearch: (text: string) =>
      `${AG_CLN_CROSS}/api/v1/catalogs/active-principles/search?text=${encodeURIComponent(text)}`,
    IdentifierTypes: (entityType: string) =>
      `${AG_CLN_CROSS}/api/v1/catalogs/identifier-types?entity_type=${encodeURIComponent(entityType)}`,
    TimeUnits: () => `${AG_CLN_CROSS}/api/v1/catalogs/time-units`,
    AgeGroups: () => `${AG_CLN_CROSS}/api/v1/catalogs/age-groups`,
  },
} as const;
