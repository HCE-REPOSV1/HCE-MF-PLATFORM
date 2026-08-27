/**
 * ---------------------------------------------------------
 * Endpoints centralizados — mf-auth
 * Toda URL se lee de variables de entorno (.env).
 *
 * mf-auth SÍ llama al API Gateway directamente para i18n (a diferencia
 * del login, que delega en shell/AuthService) — son rutas públicas
 * (`i18n/locales`, `i18n/public/...`) pensadas para correr ANTES de que
 * exista sesión, así que no hay motivo para pasarlas por el shell.
 * ---------------------------------------------------------
 */

const AG_CROSS = import.meta.env.VITE_APIGW_CNL_CROSS

if (!AG_CROSS) throw new Error("[mf-auth] VITE_APIGW_CNL_CROSS no está configurado")

export const ENDPOINTS = {

  i18n: {
    /** Manifest de idiomas disponibles — público */
    locales: `${AG_CROSS}/api/v1/i18n/locales`,
    /** Bundle de traducción público (namespace debe estar en el allow-list del backend: common/auth) */
    publicNamespace: (locale: string, namespace: string) =>
      `${AG_CROSS}/api/v1/i18n/public/${locale}/${namespace}`,
  },

} as const
