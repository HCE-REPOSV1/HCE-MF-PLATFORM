/**
 * ---------------------------------------------------------
 * Endpoints centralizados — mf-shell
 * Fuente única de verdad para todas las URLs del sistema.
 * Toda URL se lee de variables de entorno (.env).
 * Si falta una variable obligatoria, el build falla en startup.
 * ---------------------------------------------------------
 */

const AG_CROSS = import.meta.env.VITE_APIGE_CNL_CROSS
if (!AG_CROSS) throw new Error("[mf-shell] VITE_APIGE_CNL_CROSS no está configurado")

export const ENDPOINTS = {

  /** Autenticación y sesión (API Gateway → auth-service) */
  auth: {
    login:           `${AG_CROSS}/api/v1/auth/login`,
    logout:          `${AG_CROSS}/api/v1/auth/logout`,
    refresh:         `${AG_CROSS}/api/v1/auth/refresh`,
    me:              `${AG_CROSS}/api/v1/auth/me`,
    accesos:         `${AG_CROSS}/api/v1/auth/accesos`,
    cambiarClave:    `${AG_CROSS}/api/v1/auth/cambiar-contrasena`,
    cerrarSesion:    `${AG_CROSS}/api/v1/auth/cerrar-sesion`,
    validateToken:   `${AG_CROSS}/api/v1/auth/validate`,
  },

  /** Organización y sedes */
  organization: {
    locations: `${AG_CROSS}/api/v1/organization/1/locations`,
  },

} as const
