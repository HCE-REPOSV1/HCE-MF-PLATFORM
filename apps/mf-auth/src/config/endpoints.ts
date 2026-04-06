/**
 * ---------------------------------------------------------
 * Endpoints centralizados — mf-auth
 * Fuente única de verdad para todas las URLs del sistema.
 * Toda URL se lee de variables de entorno (.env).
 * Si falta una variable obligatoria, el build falla en startup.
 * ---------------------------------------------------------
 */

const AG = import.meta.env.VITE_AUTH_URL
if (!AG) throw new Error("[mf-auth] VITE_AUTH_URL no está configurado")

export const ENDPOINTS = {

  /** Autenticación y sesión (API Gateway → auth-service) */
  auth: {
    login:  `${AG}/auth/login`,
  },

} as const
