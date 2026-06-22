/**
 * ---------------------------------------------------------
 * Endpoints centralizados — mf-header
 * Fuente única de verdad para las URLs del practitioner.
 * Toda URL se lee de variables de entorno (.env).
 * Si falta una variable obligatoria, el build falla en startup.
 * ---------------------------------------------------------
 */

const AG_CROSS = import.meta.env.VITE_APIGE_CNL_CROSS
const AG_WEB_EMERGENCY = import.meta.env.VITE_APIGW_CNL_WEB_EMERGENCY
if (!AG_CROSS) throw new Error("[mf-header] VITE_APIGE_CNL_CROSS no está configurado")
if (!AG_WEB_EMERGENCY) throw new Error("[mf-header] VITE_APIGW_CNL_WEB_EMERGENCY no está configurado")

export const ENDPOINTS = {

  /** Datos del practitioner autenticado */
  practitioners: {
    byUsername: (username: string) => `${AG_WEB_EMERGENCY}/api/v1/practitioner/by-username/${username}`,
    photo:      (practitionerUuid: string) => `${AG_CROSS}/api/v1/media/practitioner/${practitionerUuid}/photo`,
  },

} as const
