/**
 * ---------------------------------------------------------
 * Endpoints centralizados — mf-shell
 * Fuente única de verdad para todas las URLs del sistema.
 * Toda URL se lee de variables de entorno (.env).
 * Si falta una variable obligatoria, el build falla en startup.
 * ---------------------------------------------------------
 */

const AG = import.meta.env.VITE_AUTH_URL
if (!AG) throw new Error("[mf-shell] VITE_AUTH_URL no está configurado")

export const ENDPOINTS = {

  /** Autenticación y sesión (API Gateway → auth-service) */
  auth: {
    login:           `${AG}/api/v1/auth/login`,
    logout:          `${AG}/api/v1/auth/logout`,
    refresh:         `${AG}/api/v1/auth/refresh`,
    me:              `${AG}/api/v1/auth/me`,
    accesos:         `${AG}/api/v1/auth/accesos`,
    cambiarClave:    `${AG}/api/v1/auth/cambiar-contrasena`,
    cerrarSesion:    `${AG}/api/v1/auth/cerrar-sesion`,
    validateToken:   `${AG}/api/v1/auth/validate`,
  },

  /** Datos del practitioner autenticado */
  practitioners: {
    byUsername: (username: string) => `${AG}/api/v1/practitioner/by-username/${username}`,
    photo:      (practitionerUuid: string) => `${AG}/api/v1/media/practitioner/${practitionerUuid}/photo`,
  },

} as const
