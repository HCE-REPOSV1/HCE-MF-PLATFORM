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
