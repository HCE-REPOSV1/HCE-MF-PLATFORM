/**
 * Códigos semánticos de permisos para el módulo Ambulatorio.
 *
 * [MAC]  = ya mapeado en macMapping.ts
 * [PROV] = provisional, hasPermission devuelve true hasta que MAC lo defina
 */
export const PERMISOS_AMBULATORIO = {
  module:    "ambulatorio:module",    // [MAC]  01/01 — acceso al módulo completo
  agenda:    "ambulatorio:agenda",    // [PROV] página Agenda
  consultas: "ambulatorio:consultas", // [PROV] página Consultas
  reports:   "ambulatorio:reports",   // [PROV] página Reportes
} as const
