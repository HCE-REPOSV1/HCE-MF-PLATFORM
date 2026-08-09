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
export const PERMISOS_EMERGENCY = {
  module:   "emergency:module",    // [MAC]  01/02 — acceso al módulo completo
  monitor:  "emergency:monitor",   // [PROV] página Monitor (índice del módulo)
  patients: "emergency:patients",  // [PROV] página Pacientes
  reports:  "emergency:reports",   // [PROV] página Reportes
  settings: "emergency:settings",  // [PROV] página Configuración
  beds:     "emergency:beds",      // [PROV] panel de disponibilidad de camas (BedAvailabilityDrawerV2)
  clinicalRecord: "emergency:clinical_record",
  allergy:{
    base:  "emergency:clinical_record:allergy",        
    read:  "emergency:clinical_record:allergy:read",   
    write: "emergency:clinical_record:allergy:write", 

  },
  triage: {
    base:  "emergency:triage",        // [MAC]  01/02/01 — acceso al modal de triaje
    read:  "emergency:triage:read",   // [MAC derivado] ver triaje (botón Prioridad en grilla)
    write: "emergency:triage:write",  // [MAC derivado] crear triaje (botón menú superior)
    // Componentes internos del modal — todos PROV hasta que MAC los defina
    campos: {
      signosVitales:  "emergency:triage:campos:signos_vitales",
      clasificacion:  "emergency:triage:campos:clasificacion",
      motivoConsulta: "emergency:triage:campos:motivo_consulta",
      alergias:       "emergency:triage:campos:alergias",
      eva:            "emergency:triage:campos:eva",
    },
  },
} as const
