/**
 * ---------------------------------------------------------
 * Service: api.service
 * Expuesto via Module Federation (./ApiClient).
 * Wrapper de fetch para llamadas protegidas por cookie (access_token).
 *
 * Si la respuesta es 401:
 *   1. Dispara /auth/refresh — compartido entre requests concurrentes
 *      via lock (una sola llamada a refresh aunque fallen varias requests
 *      en paralelo).
 *   2. Si el refresh funciona, reintenta la request original una vez.
 *   3. Si el refresh también falla, el backend ya limpió ambas cookies:
 *      se emite SESSION_EXPIRED_EVENT (para que mf-shell cierre la sesión
 *      aunque la request protegida venga de otro microfrontend) y se
 *      lanza SessionExpiredError.
 *
 * Agrega además `Accept-Language` en cada request, derivado del idioma
 * activo de @hce/i18n-core (i18n.language, lectura sincrónica del singleton
 * i18next -- no requiere await ni contexto de React). El backend (ver
 * TranslationEnricher en ms-bs-catalogs y los endpoints de patient-summary/
 * patient/:id/full) resuelve campos de catálogo server-side según este
 * header, con fallback a "es" si no se envía. Sin este header, el backend
 * SIEMPRE responde en español sin importar el idioma activo de la UI.
 * ---------------------------------------------------------
 */
import { i18n } from "@hce/i18n-core"
import { ENDPOINTS } from "../config/endpoints"

function withAcceptLanguage(headers: HeadersInit | undefined): Headers {
  const merged = new Headers(headers)
  if (!merged.has("Accept-Language")) {
    merged.set("Accept-Language", i18n.language)
  }
  return merged
}

export const SESSION_EXPIRED_EVENT = "hce:session-expired"

export class SessionExpiredError extends Error {
  constructor() {
    super("Sesión expirada — el refresh también falló")
  }
}

let refreshing: Promise<boolean> | null = null

function refreshToken(): Promise<boolean> {
  if (!refreshing) {
    refreshing = fetch(ENDPOINTS.auth.refresh, { method: "POST", credentials: "include" })
      .then(res => res.ok)
      .catch(() => false)
      .finally(() => { refreshing = null })
  }
  return refreshing
}

export async function apiFetch(url: string, options: RequestInit = {}, _retried = false): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: withAcceptLanguage(options.headers),
  })

  if (res.status !== 401 || _retried) return res

  const refreshed = await refreshToken()
  if (!refreshed) {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    throw new SessionExpiredError()
  }

  // Reintento único — la cookie access_token nueva ya la puso el browser via Set-Cookie
  return apiFetch(url, options, true)
}
