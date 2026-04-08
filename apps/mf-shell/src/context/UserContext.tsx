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

interface UserContextValue {
  user:           UserProfile | null
  permisos:       Permiso[]
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
  const [sede,     setSede]     = useState<string>('')
  const [loading,  setLoading]  = useState(true)

  const fetchMe = async () => {
    try {
      const res = await fetch(ENDPOINTS.auth.me, { credentials: "include" })
      if (res.ok) {
        const json = await res.json()
        setUser(json.data)
      } else {
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

    // Obtener permisos solo si el usuario autenticó correctamente
    try {
      const res = await fetch(ENDPOINTS.auth.accesos, { credentials: "include" })
      if (res.ok) {
        const json = await res.json()
        setPermisos(json.data?.permisos ?? [])
      }
    } catch {
      setPermisos([])
    } finally {
      setLoading(false)
    }
  }

  // E = activo, L = lectura (tratar como activo), O = inactivo
  const hasPermission = (codigo: string): boolean =>
    permisos.some(p => p.codigo === codigo && (p.indicador === 'E' || p.indicador === 'L'))

  const logout = async () => {
    try {
      await fetch(ENDPOINTS.auth.logout, { method: "POST", credentials: "include" })
    } finally {
      setUser(null)
      setPermisos([])
      setSede('')
    }
  }

  useEffect(() => { fetchMe() }, [])

  return (
    <UserContext.Provider value={{ user, permisos, sede, loading, hasPermission, refetch: fetchMe, logout, setSede }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
