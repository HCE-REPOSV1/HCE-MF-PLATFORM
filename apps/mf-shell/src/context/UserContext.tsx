/**
 * ---------------------------------------------------------
 * Context: UserContext
 * Description:
 * Provee el perfil del usuario autenticado a toda la app.
 * Los datos viven SOLO en memoria (React state) — nada en
 * sessionStorage, localStorage ni cookies legibles.
 *
 * Flujo:
 *   1. Al montar → llama GET /auth/me (cookie httpOnly va automática)
 *   2. Si responde OK → guarda perfil en estado React
 *   3. Si responde 401 → usuario no autenticado (user = null)
 *   4. Al cerrar tab / recargar → estado se limpia, /auth/me rehidrata
 * ---------------------------------------------------------
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { OpcionMAC } from "@hce/design-system"
import { ENDPOINTS } from "../config/endpoints"

export interface Sucursal {
  idSede:      string
  descripcion: string
}

export interface UserProfile {
  userId:          string
  username:        string
  email:           string
  roles:           string[]
  idUsuario:       string
  nombres:         string
  apellidoPaterno: string
  apellidoMaterno: string
  nombreCompleto:  string
  nombrePerfil:    string
  numeroDocumento: string
  idPerfil:        string
  sucursales:      Sucursal[]
  sessionId:       string
}

export interface Permiso {
  codigo:    string  // ej: "01", "01/01"
  titulo:    string  // ej: "Monitor Emergencia"
  indicador: string  // ej: "E"
}

// OpcionMAC se importa de @hce/design-system — incluye vista, idMenu, idMenuPadre
export type { OpcionMAC } from "@hce/design-system"

/**
 * Filtra recursivamente las opciones MAC:
 * - Mantiene solo las que tienen indicador "E" (activo) o "L" (lectura)
 * - Descarta las que tienen indicador "O" (deshabilitado)
 * - Si un padre no tiene hijos visibles tras el filtro, también se descarta
 */
function filtrarOpciones(opciones: OpcionMAC[]): OpcionMAC[] {
  return opciones
    .filter(op => op.indicador === "E" || op.indicador === "L")
    .map(op => ({
      ...op,
      opciones: op.opciones ? filtrarOpciones(op.opciones) : undefined,
    }))
}

interface UserContextValue {
  user:           UserProfile | null
  permisos:       Permiso[]
  /** Árbol original de opciones MAC (para renderizar el sidebar) */
  opciones:       OpcionMAC[]
  sede:           string
  loading:        boolean
  hasPermission:  (codigo: string) => boolean
  refetch:        () => Promise<void>
  logout:         () => Promise<void>
  setSede:        (sede: string) => void
}

const UserContext = createContext<UserContextValue>({
  user:          null,
  permisos:      [],
  opciones:      [],
  sede:          '',
  loading:       true,
  hasPermission: () => false,
  refetch:       async () => {},
  logout:        async () => {},
  setSede:       () => {},
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [user,     setUser]     = useState<UserProfile | null>(null)
  const [permisos, setPermisos] = useState<Permiso[]>([])
  const [opciones, setOpciones] = useState<OpcionMAC[]>([])
  const [sede,     setSede]     = useState<string>('')
  const [loading,  setLoading]  = useState(true)

  // ── Cierra sesión: invalida la cookie en el servidor y limpia estado local ──
  // También es llamado automáticamente cuando el token MAC expira (401 en /auth/accesos)
  const logout = async () => {
    try {
      await fetch(ENDPOINTS.auth.logout, { method: "POST", credentials: "include" })
    } finally {
      setUser(null)
      setPermisos([])
      setOpciones([])
      setSede('')
    }
  }

  const fetchMe = async () => {
    // 1. Validar sesión activa
    try {
      const res = await fetch(ENDPOINTS.auth.me, { credentials: "include" })
      if (res.ok) {
        const json = await res.json()
        const userData = json.data as UserProfile
        setUser(userData)
        // Auto-selecciona la primera sede si aún no hay una seleccionada
        if (userData.sucursales?.length > 0) {
          setSede(prev => prev || userData.sucursales[0].idSede)
        }
      } else {
        // 401 sin sesión previa: no hay cookie que invalidar, solo limpiar estado
        setUser(null)
        setPermisos([])
        setLoading(false)
        return
      }
    } catch {
      setUser(null)
      setPermisos([])
      setLoading(false)
      return
    }

    // 2. Obtener permisos MAC (solo si /auth/me fue exitoso)
    try {
      const res = await fetch(ENDPOINTS.auth.accesos, { credentials: "include" })
      if (res.ok) {
        const json = await res.json()
        setOpciones(filtrarOpciones(json.data?.opciones ?? []))
        setPermisos(json.data?.permisos ?? [])
      } else if (res.status === 401) {
        // Token MAC inválido o expirado — cerrar sesión completa
        await logout()
        return
      }
      // Otros errores (503, 504, etc.): continuar sin permisos, no cerrar sesión
    } catch {
      setOpciones([])
      setPermisos([])
    } finally {
      setLoading(false)
    }
  }

  // E = activo, L = lectura (tratar como activo), O = inactivo
  const hasPermission = (codigo: string): boolean =>
    permisos.some(p => p.codigo === codigo && (p.indicador === 'E' || p.indicador === 'L'))

  useEffect(() => { fetchMe() }, [])

  return (
    <UserContext.Provider value={{ user, permisos, opciones, sede, loading, hasPermission, refetch: fetchMe, logout, setSede }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
