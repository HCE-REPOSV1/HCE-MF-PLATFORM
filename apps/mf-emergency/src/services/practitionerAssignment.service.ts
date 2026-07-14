import { ENDPOINTS } from '../config/endpoints'

// Espejo de PractitionerAssignmentCandidateRow (ms-bs-core-emergency-monitor).
// practitioner_name siempre null en assignment-candidates (por definición no tienen
// ATND activo) y siempre presente en reassignment-candidates.
export interface AssignmentCandidate {
  encounter_id:       number
  patient_id:         number
  patient_name:       string
  document_number:    string | null
  attention_id:       string | null
  practitioner_id:    number | null
  practitioner_name:  string | null
}

export interface AssignPractitionerPayload {
  ad_username:        string
  assignment_reason?: string
  user_modify:        string
}

/** Error HTTP con el status adjunto — permite distinguir 404 (practitioner no
 * encontrado / no es médico) de otros errores (500, red, etc.) en la UI. */
export class HttpError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
    this.name = 'HttpError'
  }
}

async function getCandidates(url: string): Promise<AssignmentCandidate[]> {
  const res = await fetch(url, { method: 'GET', credentials: 'include' })
  const body = await res.json()
  if (!res.ok) throw new Error(body?.message ?? `HTTP ${res.status}`)
  return body?.data ?? []
}

/** GET /emergency-monitor/assignment-candidates — pacientes sin médico asignado. */
export function getAssignmentCandidates(locationUuid: string, page = 1, limit = 20): Promise<AssignmentCandidate[]> {
  return getCandidates(ENDPOINTS.practitionerAssignment.assignmentCandidates(locationUuid, page, limit))
}

/** GET /emergency-monitor/reassignment-candidates — pacientes con médico asignado, sin alta. */
export function getReassignmentCandidates(locationUuid: string, page = 1, limit = 20): Promise<AssignmentCandidate[]> {
  return getCandidates(ENDPOINTS.practitionerAssignment.reassignmentCandidates(locationUuid, page, limit))
}

/** PATCH /encounter/:id/assign-practitioner — mismo endpoint para asignar y reasignar. */
export async function assignPractitioner(encounterId: number, payload: AssignPractitionerPayload): Promise<unknown> {
  const res = await fetch(ENDPOINTS.practitionerAssignment.assign(encounterId), {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await res.json()
  if (!res.ok) throw new HttpError(body?.message ?? `HTTP ${res.status}`, res.status)
  return body
}
