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
import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from "react"
import type { OpcionMAC } from "@hce/design-system"
import { ENDPOINTS } from "../config/endpoints"
import { apiFetch, SessionExpiredError, SESSION_EXPIRED_EVENT } from "../services/api.service"
import { MAC_TO_FRONT } from "../config/macMapping"
import { MAC_SEDE_TO_LOCATION_ID } from "../config/sedeMapping"
import { useOrgLocations } from "../hooks/useOrgLocations"

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
  idPerfil?:       string
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

export interface SedeInfo {
  id:     string
  nombre: string
}

interface UserContextValue {
  user:                   UserProfile | null
  permisos:               Permiso[]
  /** Árbol original de opciones MAC (para renderizar el sidebar) */
  opciones:               OpcionMAC[]
  sede:                   string
  /** Sede activa con id + nombre — null mientras carga o si no hay sede seleccionada */
  sedeActual:             SedeInfo | null
  /**
   * location_uuid de la sede activa — null mientras carga o si no hay sede seleccionada.
   * Campo aditivo, independiente de sedeActual.id (que sigue siendo el location_id secuencial
   * y no debe cambiar: otros módulos, ej. triage, lo consumen tal cual). Pensado para el monitor
   * público de emergencias, que requiere un identificador de sede no adivinable.
   */
  sedeActualUuid:         string | null
  /** Lista de sedes disponibles para el usuario (filtradas por MAC + mapeadas al nuevo sistema) */
  sucursalesDisponibles:  SedeInfo[]
  loading:                boolean
  hasPermission:          (codigo: string) => boolean
  refetch:                () => Promise<void>
  logout:                 () => Promise<void>
  setSede:                (sede: string) => void
}

const UserContext = createContext<UserContextValue>({
  user:                  null,
  permisos:              [],
  opciones:              [],
  sede:                  '',
  sedeActual:            null,
  sedeActualUuid:        null,
  sucursalesDisponibles: [],
  loading:               true,
  hasPermission:         () => false,
  refetch:               async () => {},
  logout:                async () => {},
  setSede:               () => {},
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [user,     setUser]     = useState<UserProfile | null>(null)
  const [permisos, setPermisos] = useState<Permiso[]>([])
  const [opciones, setOpciones] = useState<OpcionMAC[]>([])
  const [sede,     setSede]     = useState<string>('')
  const [loading,  setLoading]  = useState(true)

  // Carga las ubicaciones de la organización solo cuando hay sesión activa.
  // enabled=false limpia el resultado (útil al cerrar sesión).
  const orgLocations = useOrgLocations(!!user)

  // Sedes disponibles: MAC sucursales → location_id del nuevo sistema → datos reales de la ubicación.
  const sucursalesDisponibles = useMemo((): SedeInfo[] => {
    if (!user?.sucursales?.length || !orgLocations.length) return []
    return user.sucursales
      .map(s => {
        const locationId = MAC_SEDE_TO_LOCATION_ID[s.idSede]
        if (locationId == null) return null
        const loc = orgLocations.find(l => l.location_id === locationId)
        if (!loc) return null
        return { id: String(locationId), nombre: loc.location_alias }
      })
      .filter((s): s is SedeInfo => s !== null)
  }, [user?.sucursales, orgLocations])

  // Sede actualmente activa con su info completa.
  const sedeActual = useMemo(
    () => sucursalesDisponibles.find(s => s.id === sede) ?? null,
    [sucursalesDisponibles, sede]
  )

  // location_uuid de la sede activa (aditivo, ver comentario en UserContextValue).
  const sedeActualUuid = useMemo(() => {
    if (!sedeActual) return null
    const loc = orgLocations.find(l => String(l.location_id) === sedeActual.id)
    return loc?.location_uuid ?? null
  }, [sedeActual, orgLocations])

  // Auto-selecciona la primera sede disponible (con location_id del nuevo sistema)
  // cuando aún no hay sede activa y ya llegaron los datos de la organización.
  useEffect(() => {
    if (!sede && sucursalesDisponibles.length > 0) {
      setSede(sucursalesDisponibles[0].id)
    }
  }, [sede, sucursalesDisponibles])

  // Limpia el estado local sin llamar al backend — se usa cuando el backend
  // ya invalidó la sesión por su cuenta (refresh fallido en apiFetch)
  const clearSession = () => {
    setUser(null)
    setPermisos([])
    setOpciones([])
    setSede('')
  }

  // ── Cierra sesión: invalida la cookie en el servidor y limpia estado local ──
  const logout = async () => {
    try {
      await fetch(ENDPOINTS.auth.logout, { method: "POST", credentials: "include" })
    } finally {
      clearSession()
    }
  }

  const fetchMe = async () => {
    setLoading(true)   // Evita renders intermedios con user!=null pero opciones vacías
    // 1. Validar sesión activa (apiFetch ya intenta /auth/refresh si el access_token expiró)
    try {
      const res = await apiFetch(ENDPOINTS.auth.me)
      if (res.ok) {
        const json = await res.json()
        const userData = json.data as UserProfile
        setUser(userData)
      } else {
        // Sin sesión previa: no hay cookie que invalidar, solo limpiar estado
        clearSession()
        setLoading(false)
        return
      }
    } catch {
      // SessionExpiredError (refresh también falló) o error de red: sin sesión válida
      clearSession()
      setLoading(false)
      return
    }

    // 2. Obtener permisos MAC (solo si /auth/me fue exitoso)
    try {
      const res = await apiFetch(ENDPOINTS.auth.accesos)
      if (res.ok) {
        const json = await res.json()
        setOpciones(filtrarOpciones(json.data?.opciones ?? []))
        setPermisos(json.data?.permisos ?? [])
      } else {
        // !ok que no sea 401 (apiFetch ya reintentó el 401 internamente): sin permisos, no cerrar sesión
        setOpciones([])
        setPermisos([])
      }
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        // Refresh también falló — el backend ya limpió las cookies
        clearSession()
        return
      }
      // Error de red (503, 504, etc.): continuar sin permisos, no cerrar sesión
      setOpciones([])
      setPermisos([])
    } finally {
      setLoading(false)
    }
  }

  // Deriva el set de permisos semánticos desde la respuesta MAC + el mapping.
  // - indicador "E" → agrega :read y :write
  // - indicador "L" → agrega solo :read
  // - indicador "O" → no agrega nada
  const { returnedFrontCodes, permisosSet } = useMemo(() => {
    const returned = new Map<string, string>()
    permisos.forEach(p => {
      const fc = MAC_TO_FRONT[p.codigo]
      if (fc) returned.set(fc, p.indicador)
    })
    const set = new Set<string>()
    returned.forEach((indicador, fc) => {
      if (indicador === "E" || indicador === "L") {
        set.add(fc)
        set.add(`${fc}:read`)
      }
      if (indicador === "E") {
        set.add(`${fc}:write`)
      }
    })
    return { returnedFrontCodes: returned, permisosSet: set }
  }, [permisos])

  // Acepta códigos semánticos internos: "emergency:module", "emergency:triage:read", etc.
  // Si el código base no aparece en la respuesta MAC todavía → provisional → true.
  // Si MAC lo retornó → usa el valor real del indicador.
  const hasPermission = useCallback((codigo: string): boolean => {
    const base = codigo.replace(/:(?:read|write)$/, "")
    if (!returnedFrontCodes.has(base)) return true
    return permisosSet.has(codigo)
  }, [returnedFrontCodes, permisosSet])

  useEffect(() => { fetchMe() }, [])

  // Cualquier microfrontend (no solo mf-shell) puede disparar este evento si su
  // propio apiFetch agota el refresh — la sesión debe cerrarse igual en todos lados
  useEffect(() => {
    const onSessionExpired = () => clearSession()
    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired)
  }, [])

  return (
    <UserContext.Provider value={{ user, permisos, opciones, sede, sedeActual, sedeActualUuid, sucursalesDisponibles, loading, hasPermission, refetch: fetchMe, logout, setSede }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
