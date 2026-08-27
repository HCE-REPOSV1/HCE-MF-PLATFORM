/**
 * ---------------------------------------------------------
 * Endpoints centralizados — mf-home
 * Toda URL se lee de variables de entorno (.env).
 * ---------------------------------------------------------
 */

const AG_CROSS = import.meta.env.VITE_APIGW_CNL_CROSS

if (!AG_CROSS) throw new Error("[mf-home] VITE_APIGW_CNL_CROSS no está configurado")

export const ENDPOINTS = {

  /** i18n — manifest público; namespace "home" protegido (requiere sesión) */
  i18n: {
    locales:   `${AG_CROSS}/api/v1/i18n/locales`,
    namespace: (locale: string, namespace: string) => `${AG_CROSS}/api/v1/i18n/${locale}/${namespace}`,
  },

} as const
