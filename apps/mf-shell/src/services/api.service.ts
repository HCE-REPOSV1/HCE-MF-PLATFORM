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
 * ---------------------------------------------------------
 */
import { ENDPOINTS } from "../config/endpoints"

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
  const res = await fetch(url, { ...options, credentials: "include" })

  if (res.status !== 401 || _retried) return res

  const refreshed = await refreshToken()
  if (!refreshed) {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    throw new SessionExpiredError()
  }

  // Reintento único — la cookie access_token nueva ya la puso el browser via Set-Cookie
  return apiFetch(url, options, true)
}
