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
    login:           `${AG}/auth/login`,
    logout:          `${AG}/auth/logout`,
    refresh:         `${AG}/auth/refresh`,
    me:              `${AG}/auth/me`,
    accesos:         `${AG}/auth/accesos`,
    cambiarClave:    `${AG}/auth/cambiar-contrasena`,
    cerrarSesion:    `${AG}/auth/cerrar-sesion`,
    validateToken:   `${AG}/auth/validate`,
  },

  /** Datos del practitioner autenticado */
  practitioners: {
    byUsername: (username: string) => `${AG}/practitioners/by-username/${username}`,
    photo:      (practitionerUuid: string) => `${AG}/files/practitioner/${practitionerUuid}/photo`,
  },

} as const
