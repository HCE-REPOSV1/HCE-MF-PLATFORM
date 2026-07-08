import type { TriagePriority } from "@hce/design-system"
import type { TriajeForm } from "../Triage"
import type { TriageFullApiResponse } from "../types/triageFull.api.types"

function toDisplayDate(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  return `${dd}/${mm}/${d.getFullYear()}`
}

function toSexo(gender: string | null | undefined): string {
  if (gender === "male") return "M"
  if (gender === "female") return "F"
  return ""
}

// document_type llega del catálogo identifier-types (ms-bs-catalogs) — se normaliza
// case-insensitive a los 3 valores que maneja hoy el SelectField del formulario.
// Best-effort: un código de catálogo no contemplado aquí queda sin preseleccionar.
function toTipoDoc(documentType: string | null | undefined): string {
  const value = (documentType ?? "").toLowerCase()
  if (value.includes("dni")) return "dni"
  if (value.includes("carn") || value === "ce") return "ce"
  if (value.includes("pasaporte") || value.includes("passport")) return "pasaporte"
  return ""
}

function toTiempoUnidad(unit: string | null | undefined): string {
  if (unit === "dias") return "días"
  return unit ?? "horas"
}

function toTriagePriority(level: number | null | undefined): TriagePriority | null {
  switch (level) {
    case 1: return "I"
    case 2: return "II"
    case 3: return "III"
    case 4: return "IV"
    default: return null
  }
}

/** Traduce GET /triage/:id/full a la forma local del formulario (TriajeForm), para precarga en modo lectura. */
export function mapTriageFullToForm(response: TriageFullApiResponse["data"]): Partial<TriajeForm> {
  const { triage, vitalSign, glasgowScale, fastScale, patient, allergyIntolerance } = response

  return {
    // Datos del paciente
    tipoDoc:         toTipoDoc(patient?.document_type),
    numeroDoc:       patient?.document_number ?? "",
    nombres:         patient?.first_name ?? "",
    apellidoPaterno: patient?.last_name_father ?? "",
    apellidoMaterno: patient?.last_name_mother ?? "",
    fechaNacimiento: toDisplayDate(patient?.birth_date),
    sexo:            toSexo(patient?.gender),

    // Datos clínicos
    motivoQuery:      triage.chief_complaint_code ?? "",
    aislamiento:      triage.isolation_required ? "Si" : "No",
    gestante:         triage.is_pregnant == null ? "" : (triage.is_pregnant ? "Si" : "No"),
    furEnabled:       Boolean(triage.fur_enabled),
    fur:              toDisplayDate(triage.fur_date),
    tiempoEnfermedad: triage.illness_duration != null ? String(triage.illness_duration) : "",
    tiempoUnidad:     toTiempoUnidad(triage.illness_duration_unit),
    comentarios:      triage.comments ?? "",

    // Signos vitales
    traumaShock:    Boolean(vitalSign?.trauma_shock_flag),
    noSV:           Boolean(vitalSign?.impossible_capture_flag),
    peso:           vitalSign?.weight_kg != null ? String(vitalSign.weight_kg) : "",
    talla:          vitalSign?.height_cm != null ? String(vitalSign.height_cm) : "",
    frCardiaca:     vitalSign?.heart_rate != null ? String(vitalSign.heart_rate) : "",
    frRespiratoria: vitalSign?.respiratory_rate != null ? String(vitalSign.respiratory_rate) : "",
    pSistolica:     vitalSign?.systolic_pressure != null ? String(vitalSign.systolic_pressure) : "",
    pDiastolica:    vitalSign?.diastolic_pressure != null ? String(vitalSign.diastolic_pressure) : "",
    temperatura:    vitalSign?.temperature_c != null ? String(vitalSign.temperature_c) : "",
    saturacionO2:   vitalSign?.oxygen_saturation != null ? String(vitalSign.oxygen_saturation) : "",
    glasgow: {
      ocular: glasgowScale?.ocular_response != null ? String(glasgowScale.ocular_response) : "1",
      verbal: glasgowScale?.verbal_response != null ? String(glasgowScale.verbal_response) : "1",
      motora: glasgowScale?.motor_response != null ? String(glasgowScale.motor_response) : "1",
    },
    fast: {
      cara:   fastScale?.face_flag ? "Sí" : "No",
      brazos: fastScale?.arm_flag ? "Sí" : "No",
      habla:  fastScale?.speech_flag ? "Sí" : "No",
      tiempo: fastScale?.time_flag ? "Sí" : "No",
    },

    // Alergias
    tieneAlergia:  allergyIntolerance?.has_allergies === "S" ? "si" : allergyIntolerance ? "niega" : "",
    alimentos:     allergyIntolerance?.food_allergies ?? "",
    otrosAlergias: allergyIntolerance?.other_allergies ?? "",

    // EVA
    dolEva: triage.pain_scale_eva ?? null,

    // Triaje
    prioridad: toTriagePriority(triage.triage_level),
  }
}
