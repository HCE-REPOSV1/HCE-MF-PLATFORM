/**
 * Códigos semánticos de permisos para el módulo Hospital.
 *
 * [MAC]  = ya mapeado en macMapping.ts
 * [PROV] = provisional, hasPermission devuelve true hasta que MAC lo defina
 */
export const PERMISOS_HOSPITAL = {
  module:     "hospital:module",     // [MAC]  01/03 — acceso al módulo completo
  panel:      "hospital:panel",      // [PROV] página Panel Hospital
  internados: "hospital:internados", // [PROV] página Internados
  quirofanos: "hospital:quirofanos", // [PROV] página Quirófanos
  reports:    "hospital:reports",    // [PROV] página Reportes
} as const
