import type { PriorityLevel } from "@hce/design-system"

export type SemaphoreColor = "green" | "yellow" | "red"  | null

export interface MonitorSummary{
label:string
value:number


}

export interface MonitorTableRow {
  id: string

  monitor_id: string
  encounter_id: number | null
  triage_id: number | null
  patient_id: number | null
  priority: PriorityLevel | "none"
  priority_sort: number | null

  box: {
    label?: string
    stage: "ESPERA" | "SALA_D" | "BOX_ASIGNADO"
    color: SemaphoreColor
  }

  document_number: string
  document_number_masked: string

 
  patient_name: string
  patient_name_masked: string

  age: string
  sex: "F" | "M" | "-"

  physician_assigned: boolean
  physician_name_display: string

  lab: "ok" | "urgent" | "alert" | "empty"
  img: "ok" | "urgent" | "alert" | "empty"
  indication: "ok" | "urgent" | "alert" | "empty"
  interconsult: "ok" | "urgent" | "alert" | "empty"

  attention_id: string | "none"

  waiting_time_box_display: string
  waiting_time_box_color: SemaphoreColor

  waiting_time_physician_display: string
  waiting_time_physician_color: SemaphoreColor

  attentionDate: string
  attentionHour: string
  attention_datetime: string | null

  dischargeDate: string
  dischargeHour: string

  has_discharge: boolean
  row_alert_color: "red" | null
  is_vip: boolean
}