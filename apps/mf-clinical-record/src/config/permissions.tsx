/**
 * Códigos semánticos de permisos para el módulo Historia Clínica (mf-clinical-record).
 *
 * Estado de cada código:
 *   [MAC]  = ya mapeado en macMapping.ts, respetará lo que retorne MAC
 *   [PROV] = provisional, hasPermission devuelve true hasta que MAC lo defina
 *
 * Cuando MAC entregue nuevos códigos, actualizar SOLO macMapping.ts — este
 * archivo no necesita cambios, solo agregar filas allá.
 */
export const PERMISSIONS_CLINICAL_RECORD = {
  allergy: {
    base:  "emergency:clinical_record:allergy",
    read:  "emergency:clinical_record:allergy:read",
    write: "emergency:clinical_record:allergy:write",
  },
  historyPhysicalExam: {
    base:  "emergency:clinical_record:history_physical_exam",
    read:  "emergency:clinical_record:history_physical_exam:read",
    write: "emergency:clinical_record:history_physical_exam:write",
    campos: {
      motivoConsulta: "emergency:clinical_record:history_physical_exam:campos:motivo_consulta",
      antecedentes:   "emergency:clinical_record:history_physical_exam:campos:antecedentes",
      reconciliacion: "emergency:clinical_record:history_physical_exam:campos:reconciliacion_medicamentosa",
    },
  },
  diagnosis: {
    base:  "emergency:clinical_record:diagnosis",
    read:  "emergency:clinical_record:diagnosis:read",
    write: "emergency:clinical_record:diagnosis:write",
    campos: {
      diagnosisNotes: "emergency:clinical_record:diagnosis:campos:notas",
    },
  },
} as const;