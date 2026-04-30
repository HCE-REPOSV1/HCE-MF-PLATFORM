/**
 * ---------------------------------------------------------
 * Hook: usePractitioner
 * Carga los datos del practitioner autenticado por su username.
 * Solo se ejecuta cuando el usuario ya tiene sesión activa (username disponible).
 *
 * Estados de retorno:
 *   loading  → petición en curso
 *   error    → falló la petición (error de red; 404 devuelve null sin error)
 *   data     → PractitionerProfile | null
 *   photoUrl → URL de la foto lista para usar como src en <img>
 *   subtitle → especialidad o rol según lógica del servicio
 * ---------------------------------------------------------
 */
import { useState, useEffect } from "react"
import {
  getPractitionerByUsername,
  getPractitionerPhotoUrl,
  getPractitionerSubtitle,
  type PractitionerProfile,
} from "../services/practitioner.service"

interface UsePractitionerResult {
  data:     PractitionerProfile | null
  photoUrl: string | null
  subtitle: string | null
  loading:  boolean
  error:    string | null
}

export function usePractitioner(username: string | null | undefined): UsePractitionerResult {
  const [data,     setData]     = useState<PractitionerProfile | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    if (!username) {
      setData(null)
      setPhotoUrl(null)
      setError(null)
      return
    }

    let cancelled = false
    let blobUrl: string | null = null

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const profile = await getPractitionerByUsername(username)
        if (cancelled) return

        setData(profile)

        // Fetch de la foto como blob para evitar ERR_BLOCKED_BY_RESPONSE.NotSameOrigin.
        // El browser bloquea <img src> cross-origin cuando el servidor devuelve
        // Cross-Origin-Resource-Policy: same-origin. Hacerlo via fetch() con
        // credentials y convertir a blob URL evita esa restricción.
        if (profile?.practitioner_uuid) {
          try {
            const res = await fetch(getPractitionerPhotoUrl(profile.practitioner_uuid), {
              credentials: "include",
            })
            if (!cancelled && res.ok) {
              const blob = await res.blob()
              if (!cancelled) {
                blobUrl = URL.createObjectURL(blob)
                setPhotoUrl(blobUrl)
              }
            }
          } catch {
            // Foto no disponible — el Avatar mostrará las iniciales como fallback
          }
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Error al cargar perfil del practitioner"
          setError(msg)
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [username])

  const subtitle = data ? getPractitionerSubtitle(data) : null

  return { data, photoUrl, subtitle, loading, error }
}
