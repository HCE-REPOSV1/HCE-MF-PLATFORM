/**
 * Códigos semánticos de permisos para el módulo Auditoría.
 *
 * [MAC]  = ya mapeado en macMapping.ts
 * [PROV] = provisional, hasPermission devuelve true hasta que MAC lo defina
 */
export const PERMISOS_AUDITORIA = {
  module:     "auditoria:module",    // [MAC]  01/04 — acceso al módulo completo
  dashboard:  "auditoria:dashboard", // [PROV] página Dashboard
  auditorias: "auditoria:auditorias",// [PROV] página Auditorías
  reports:    "auditoria:reports",   // [PROV] página Reportes
} as const
