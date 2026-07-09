import { ENDPOINTS } from '../config/endpoints'

export interface AvailableBedApiItem {
  bed_id: number
  bed_code: string
  bed_name?: string | null
  bed_status?: string
}

export interface BedOption {
  id: string
  label: string
}


export interface ReassignBedPayload {
  encounter_id: number
  bed_id:       number
  assigned_by:  string
  user_create:  string
}

export async function getAvailableBeds(
  locationId: number | string,
): Promise<BedOption[]> {
  const res = await fetch(ENDPOINTS.bedManagement.available(locationId), {
    method: "GET",
    credentials: "include",
  })

  const body = await res.json()

  if (!res.ok) {
    throw new Error(body?.message ?? `HTTP ${res.status}`)
  }

  const items = body?.data ?? []

  console.log(body)

  return items.map((bed: any) => ({
    id: String(bed.bed_id),
    label:  bed.bed_code || `Cama ${bed.bed_id}`,
  }))

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
