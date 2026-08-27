/**
 * Códigos semánticos de permisos para el módulo Emergencia.
 *
 * Estado de cada código:
 *   [MAC]  = ya mapeado en macMapping.ts, respetará lo que retorne MAC
 *   [PROV] = provisional, hasPermission devuelve true hasta que MAC lo defina
 *
 * Cuando MAC entregue nuevos códigos, actualizar SOLO macMapping.ts — este
 * archivo no necesita cambios, solo agregar filas allá.
 */
export const PERMISSIONS_CLINICAL_RECORD = {
  allergy:{
    base:  "emergency:clinical_record:allergy",        
    read:  "emergency:clinical_record:allergy:read",   
    write: "emergency:clinical_record:allergy:write", 

  }
} as const
