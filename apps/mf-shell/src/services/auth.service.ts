/**
 * ---------------------------------------------------------
 * Service: auth.service
 * Expuesto via Module Federation (./AuthService) para que mf-auth
 * inicie sesión sin conocer la URL del API Gateway ni hacer fetch directo.
 *
 * Excepción arquitectónica consciente: esto crea una dependencia circular
 * de remotes (mf-shell carga "auth/Login", mf-auth carga "shell/AuthService").
 * Funciona porque Module Federation resuelve remotes en runtime, no en
 * build-time. Ningún otro remoto expone algo de vuelta hacia mf-shell —
 * todos los demás solo *consumen* shell/UserContext o shell/ApiClient. No
 * replicar este patrón salvo que un futuro remoto tenga el mismo problema
 * de "necesito llamar al gateway antes de que exista sesión".
 * ---------------------------------------------------------
 */
import { ENDPOINTS } from "../config/endpoints"

export interface LoginResult {
  ok:     boolean
  status: number
  data:   any
}

export async function login(usuario: string, password: string): Promise<LoginResult> {
  const res  = await fetch(ENDPOINTS.auth.login, {
    method:      "POST",
    headers:     { "Content-Type": "application/json" },
    credentials: "include",
    body:        JSON.stringify({ username: usuario, password }),
  })
  const data = await res.json()
  return { ok: res.ok, status: res.status, data }
}
