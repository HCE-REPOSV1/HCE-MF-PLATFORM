/**
 * ---------------------------------------------------------
 * Service: practitioner.service
 * Obtiene los datos del practitioner autenticado desde la API.
 * Endpoint: GET /practitioners/by-username/{username}
 * ---------------------------------------------------------
 */
import { ENDPOINTS } from "../config/endpoints"

export interface PractitionerProfile {
  practitioner_uuid:        string
  ad_username:              string
  name_prefix:              string       // "Dr.", "Dra.", "Lic.", etc.
  name_given:               string
  name_family:              string
  name_text:                string       // Nombre completo con prefijo
  gender:                   string
  communication_language:   string
  role_id:                  number
  role_uuid:                string
  role_code:                string       // "doctor", "nurse", etc.
  role_display:             string       // "Médico Anestesióloga"
  role_period_start:        string
  role_period_end:          string | null
  speciality_id:            number
  speciality_fhir_code:     string
  speciality_fhir_display:  string
  speciality_local_name:    string       // "ANESTESIOLOGIA"
  organisation_uuid:        string
  organisation_name:        string
  location_uuid:            string
  location_name:            string
  location_alias:           string
  location_city:            string
  location_district:        string
  location_phone:           string
  media_id:                 number | null
  photo_file_name:          string | null
  photo_content_type:       string | null
  photo_url:                string | null
}

interface PractitionerResponse {
  success: boolean
  message: string
  data:    PractitionerProfile
}

/**
 * Obtiene los datos del practitioner por su username de AD.
 * Devuelve null si no existe o si ocurre un error no crítico (404, 500).
 * Lanza el error solo para fallos de red graves.
 */
export async function getPractitionerByUsername(
  username: string,
): Promise<PractitionerProfile | null> {
  const res = await fetch(ENDPOINTS.practitioners.byUsername(username), {
    credentials: "include",
  })

  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Error ${res.status} al obtener datos del practitioner`)

  const json = await res.json() as PractitionerResponse
  if (!json.success) return null

  return json.data
}

/**
 * Construye la URL de la foto de perfil del practitioner.
 * Se usa directamente como src de <img> — el endpoint devuelve el binario.
 */
export function getPractitionerPhotoUrl(practitionerUuid: string): string {
  return ENDPOINTS.practitioners.photo(practitionerUuid)
}

/**
 * Devuelve el subtítulo que debe mostrarse bajo el nombre en el header.
 * - Si role_code === "doctor": muestra la especialidad local (en mayúsculas → Title Case)
 * - Cualquier otro rol: muestra role_display
 */
export function getPractitionerSubtitle(practitioner: PractitionerProfile): string {
  if (practitioner.role_code === "doctor") {
    // Convertir de MAYÚSCULAS a Title Case (ej: "ANESTESIOLOGIA" → "Anestesiología")
    return practitioner.speciality_local_name
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase())
  }
  return practitioner.role_display || practitioner.role_code
}
