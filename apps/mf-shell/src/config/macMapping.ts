/**
 * Mapeo MAC → códigos semánticos internos del frontend.
 *
 * Este es el ÚNICO archivo que se actualiza cuando el equipo de backend
 * entrega el árbol definitivo de permisos MAC. Los MFs nunca cambian.
 *
 * Estado de cada código:
 *   [MAC] = ya confirmado en la respuesta real del endpoint /auth/accesos
 *   [PROV] = pendiente — MAC aún no lo define; el frontend lo usa provisionalmente
 *
 * Cuando MAC entregue un nuevo código, agregar la fila aquí y nada más.
 */
export const MAC_TO_FRONT: Record<string, string> = {
  "01":       "hce:root",            // [MAC] Historias Clínicas (raíz)
  "01/01":    "ambulatorio:module",  // [MAC] HCE Ambulatorio
  "01/02":    "emergency:module",    // [MAC] HCE Emergencia
  "01/02/01": "emergency:triage",    // [MAC] TRIAJE — base para derivar :read/:write
  "01/03":    "hospital:module",     // [MAC] HCE Hospitalario
  "01/04":    "auditoria:module",    // [MAC] Auditoría Médica
  // "01/02/02": "emergency:reports",    [PROV] cuando MAC lo defina
  // "01/02/03": "emergency:settings",   [PROV]
  // "01/01/01": "ambulatorio:agenda",   [PROV]
  // "01/03/01": "hospital:panel",       [PROV]
  // "01/04/01": "auditoria:dashboard",  [PROV]
}
