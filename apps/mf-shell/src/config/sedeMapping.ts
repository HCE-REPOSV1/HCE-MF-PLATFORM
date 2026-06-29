/**
 * Mapeo de sedes: idSede del MAC (legacy) → location_id del nuevo sistema.
 * Archivo único a actualizar cuando el backend entregue el árbol definitivo.
 *
 * MAC (idSede) │ Descripción   │ Nuevo sistema (location_id)
 * ─────────────┼───────────────┼────────────────────────────
 * "2"          │ Jesús María   │ 1
 * "4"          │ La Molina     │ 2
 * "1"          │ Camacho       │ 3
 */
export const MAC_SEDE_TO_LOCATION_ID: Record<string, number> = {
  "2": 1,  // Jesús María
  "4": 2,  // La Molina
  "1": 3,  // Camacho
}
