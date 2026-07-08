import { ENDPOINTS } from '../config/endpoints'

export interface ReassignBedPayload {
  encounter_id: number
  bed_id:       number
  assigned_by:  string
  user_create:  string
}

/** POST /encounter/beds/reassign — libera la asignación activa actual del encounter (si existe) y ocupa la nueva cama. */
export async function reassignBed(payload: ReassignBedPayload): Promise<unknown> {
  const res = await fetch(ENDPOINTS.bedManagement.reassign(), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body?.message ?? `HTTP ${res.status}`)
  return body
}
