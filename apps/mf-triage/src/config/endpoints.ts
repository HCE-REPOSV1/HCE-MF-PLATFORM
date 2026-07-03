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

const CSI_INPUT_TIPO_MOTIVO = import.meta.env.VITE_CSI_INPUT_TIPO_MOTIVO;

if (!AG_WEB_EMERGENCY)
  throw new Error(
    "[mf-triage] VITE_APIGW_CNL_WEB_EMERGENCY no está configurado",
  );
if (!AG_CLN_CROSS)
  throw new Error("[mf-triage] AG_CLN_CROSS no está configurado");

export const ENDPOINTS = {
  patients: {
    ByIdentifier: (
      idValue: string | null | undefined,
      idType: string | null | undefined,
    ) =>
      `${AG_WEB_EMERGENCY}/api/v1/patient/by-identifier?identifier_value=${idValue}&identifier_type=${idType}`,
  },
  catalogs: {
    CieSearch: (text: string, column: string) =>
      `${AG_CLN_CROSS}/api/v1/catalogs/cie/search?text=${text}&column=${column}`,
    CodeSystemValue: () =>
      `${AG_CLN_CROSS}/api/v1/catalogs/code-system-values?code_system_id=${CSI_INPUT_TIPO_MOTIVO}`,
    ActivePrinciples: () => `${AG_CLN_CROSS}/api/v1/catalogs/active-principles`,
  },
} as const;
