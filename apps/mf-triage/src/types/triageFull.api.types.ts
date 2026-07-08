/** Respuesta de GET /triage/:id/full (ms-cnl-web-hce-triage) — ver TriageForm.use-case.ts::getFull. */
export interface TriageFullApiResponse {
  success: boolean
  data: {
    triage: {
      triage_id: number
      patient_id: number
      encounter_id: number | null
      location_id: number
      chief_complaint_code: string | null
      comments: string | null
      illness_duration: number | null
      illness_duration_unit: "horas" | "minutos" | "dias" | null
      pain_scale_eva: number | null
      triage_level: 1 | 2 | 3 | 4 | null
      isolation_required: boolean | null
      is_pregnant: boolean | null
      fur_enabled: boolean | null
      fur_date: string | null
    }
    vitalSign: {
      weight_kg: number | null
      height_cm: number | null
      systolic_pressure: number | null
      diastolic_pressure: number | null
      heart_rate: number | null
      respiratory_rate: number | null
      oxygen_saturation: number | null
      temperature_c: number | null
      trauma_shock_flag: boolean | null
      impossible_capture_flag: boolean | null
    } | null
    glasgowScale: {
      ocular_response: number | null
      verbal_response: number | null
      motor_response: number | null
      total_score: number | null
    } | null
    fastScale: {
      face_flag: boolean | null
      arm_flag: boolean | null
      speech_flag: boolean | null
      time_flag: boolean | null
    } | null
    /** Best-effort: puede venir con `error`/`message` en vez de los datos si ms-bs-master-patient falló. */
    patient: {
      patient_id?: number
      first_name?: string | null
      last_name_father?: string | null
      last_name_mother?: string | null
      birth_date?: string | null
      gender?: string | null
      estimated_age_group?: string | null
      document_type?: string | null
      document_number?: string | null
      error?: unknown
      message?: string
    } | null
    /** Best-effort: null si no se declaró alergia, o `{error, message}` si ms-bs-core-allergy falló. */
    allergyIntolerance: {
      allergy_intolerance_id?: number
      has_allergies?: string
      food_allergies?: string | null
      other_allergies?: string | null
      error?: unknown
      message?: string
    } | null
    allergySubstances: Array<{ active_principle_id: number }>
  }
}
