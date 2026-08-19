import type { MonitorApiItem, MonitorApiSummary, SemaphoreColor } from "../types/monitor.api.types"
import type { MonitorSummary, MonitorTableRow } from "../types/monitor.table.types"

const mapGender = (gender: MonitorApiItem["gender"]): "F" | "M" | "-" => {
  if (gender === "female") return "F"
  if (gender === "male") return "M"
  return "-"
}

const mapClinicalStatus = (
  color: SemaphoreColor,
): "ok" | "urgent" | "alert" | "empty" => {
  if (!color) return "empty"

  if (color === "green") return "ok"
  if (color === "yellow") return "alert"
  if (color === "red") return "urgent"

  return "empty"
}

const formatWaitingTime = (minutes: number | null): string => {
  if (minutes === null || minutes === undefined) return "-"

  const totalSeconds = Math.round(minutes * 60)
  const hours = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

const formatDate = (isoDate: string | null): string => {
  if (!isoDate) return "-"

  const date = new Date(isoDate)

  if (Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

const formatHour = (isoDate: string | null): string => {
  if (!isoDate) return "-"

  const date = new Date(isoDate)

  if (Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}

const getBoxLabel = (item: MonitorApiItem): string => {
  if (item.box_code != null) return item.box_code
  if (item.box_status === "ESPERA") return "ESPERA"
  if (item.box_status === "SALA_D") return "SALA D"


  return "-"
}

const formatAge = (age_display: MonitorApiItem["age_display"]): string => {
  if (!age_display) return "-"

  const [first, second] = age_display.split(" ")

  return `${first} ${second.charAt(0)}`
}

export const mapMonitorApiSummaryToSummary = (
  summary: MonitorApiSummary,
): MonitorSummary[] => {
  return [
    {
      label: "pacientes",
      value: summary.active_patients,
    },
    {
      label: "pacientes de alta",
      value: summary.discharged_patients,
    },
    {
      label: "pacientes totales",
      value: summary.total_patients,
    },
  ]
}

export const mapMonitorApiItemToTableRow = (
  item: MonitorApiItem,
): MonitorTableRow => {
  return {
    id: item.monitor_id,

    monitor_id: item.monitor_id,
    encounter_id: item.encounter_id,
    triage_id: item.triage_id,

    priority: item.priority_code ?? "none",
    priority_sort: item.priority_sort,

    box: {
      label: getBoxLabel(item),
      stage: item.box_status,
      color: item.box_semaphore_color,
    },

    document_number: item.document_number ?? "-",
    document_number_masked: item.document_number_masked ?? "-",

    patient_id: item.patient_id ?? "-",
    patient_name: item.patient_name ?? "-",
    patient_name_masked: item.patient_name_masked ?? "-",

    age: formatAge(item.age_display) ?? "-",
    sex: mapGender(item.gender),

    physician_assigned: item.physician_assigned,
    physician_name_display: item.physician_name_display ?? "-",

    lab: mapClinicalStatus(item.lab_semaphore_color),
    img: mapClinicalStatus(item.img_semaphore_color),
    indication: mapClinicalStatus(item.nursing_indication_color),
    interconsult: mapClinicalStatus(item.interconsultation_color),

    attention_id: item.attention_id ?? "none",

    waiting_time_box_display: formatWaitingTime(item.waiting_time_box_minutes),
    waiting_time_box_color: item.waiting_time_box_color,

    waiting_time_physician_display: formatWaitingTime(
      item.waiting_time_physician_minutes,
    ),
    waiting_time_physician_color: item.waiting_time_physician_color,

    attentionDate: formatDate(item.attention_datetime),
    attentionHour: formatHour(item.attention_datetime),
    attention_datetime: item.attention_datetime,

    dischargeDate: formatDate(item.discharge_datetime),
    dischargeHour: formatHour(item.discharge_datetime),

    has_discharge: item.has_discharge,
    row_alert_color: item.row_alert_color,
    is_vip: item.is_vip,
  }
}