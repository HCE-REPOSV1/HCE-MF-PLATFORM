export type MonitorBoxStatus = "ESPERA" | "SALA_D" | "BOX_ASIGNADO"

export type SemaphoreColor = "green" | "yellow" | "red"  | null

export interface MonitorApiResponse {
  success: boolean
  statusCode: number
  message: string
  data: {
    items: MonitorApiItem[]
    meta: MonitorApiMeta
    summary: MonitorApiSummary
    /** Nombre de la sede consultada (resuelto por el backend a partir del location_uuid). Null si no se pudo resolver. */
    location_name: string | null
  }
}

export interface MonitorApiMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface MonitorApiSummary {
  total_patients: number
  active_patients: number
  discharged_patients: number
}


export interface MonitorApiItem {
  monitor_id: string
  record_origin: string
  encounter_id: number | null
  triage_id: number | null
  attention_id: string | null

  patient_id: number | null
  patient_name: string | null
  patient_name_masked: string | null
  document_number: string | null
  document_number_masked: string | null
  is_vip: boolean

  gender: "female" | "male" | null
  age_display: string | null

  priority_code: 1 | 2 | 3 | 4 | null
  priority_sort: number | null
  triage_datetime: string | null

  box_status: MonitorBoxStatus
  box_code: string
  box_semaphore_color: SemaphoreColor
  location_id: number | null

  physician_assigned: boolean
  physician_name_display: string | null

  lab_semaphore_color: SemaphoreColor
  img_semaphore_color: SemaphoreColor
  nursing_indication_color: SemaphoreColor
  interconsultation_color: SemaphoreColor
  interconsultation_count: number

  attention_status: string | null

  waiting_time_box_minutes: number | null
  waiting_time_box_color: SemaphoreColor
  waiting_time_physician_minutes: number | null
  waiting_time_physician_color: SemaphoreColor

  attention_datetime: string | null
  discharge_datetime: string | null
  administrative_discharge_datetime: string | null

  has_discharge: boolean
  row_alert_color: "red" | null

  updated_at: string | null
  updated_by: string | null
}