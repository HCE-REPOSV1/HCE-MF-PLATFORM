const AG_WEB_EMERGENCY = import.meta.env.VITE_APIGW_CNL_WEB_EMERGENCY
if (!AG_WEB_EMERGENCY) throw new Error('[mf-triage] VITE_APIGW_CNL_WEB_EMERGENCY no está configurado')

export const ENDPOINTS = {

  triage: {
    /** Triaje completo (triage + vitalSign + glasgowScale + fastScale + patient + declaratoria de alergia). */
    full: (triageId: string | number) => `${AG_WEB_EMERGENCY}/api/v1/triage/${triageId}/full`,
  },

} as const
