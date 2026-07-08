import { useState, useEffect } from "react"
import { apiFetch } from "shell/ApiClient"
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
  const [data,      setData]      = useState<PractitionerProfile | null>(null)
  const [photoUrl,  setPhotoUrl]  = useState<string | null>(null)
  const [loadedFor, setLoadedFor] = useState<string | null | undefined>(undefined)
  const [error,     setError]     = useState<string | null>(null)

  const loading = username !== loadedFor

  useEffect(() => {
    if (!username) {
      setData(null); setPhotoUrl(null); setError(null); setLoadedFor(null)
      return
    }

    let cancelled = false
    let blobUrl: string | null = null

    const load = async () => {
      setError(null)

      // Intenta hasta 4 veces con 2 s entre intentos (errores transitorios de gateway).
      // Header.tsx compromete el subtítulo (doctor vs. genérico) una sola vez apenas
      // loading pasa a false — si el presupuesto de reintentos era muy corto (2 intentos,
      // 1.5s), un gateway lento agotaba los intentos y el fallback quedaba "clavado" para
      // toda la sesión de página, dando la sensación de que el subtítulo cambia entre reloads.
      let profile: PractitionerProfile | null = null
      let fetchError: unknown = null

      for (let attempt = 0; attempt < 4; attempt++) {
        if (cancelled) return
        if (attempt > 0) {
          await new Promise<void>(r => setTimeout(r, 2000))
          if (cancelled) return
        }
        try {
          profile = await getPractitionerByUsername(username)
          console.log(`[usePractitioner] intento ${attempt + 1}/4 OK`, { username, profile })
          fetchError = null
          break
        } catch (err) {
          fetchError = err
          console.log(`[usePractitioner] intento ${attempt + 1}/4 FALLÓ`, { username, err })
        }
      }

      if (cancelled) return

      if (fetchError) {
        console.log("[usePractitioner] se agotaron los 4 intentos, sin data", { username, fetchError })
        setError(fetchError instanceof Error ? fetchError.message : "Error al cargar perfil del practitioner")
        setData(null)
      } else {
        console.log("[usePractitioner] setData final", { username, profile })
        setData(profile)
        if (profile?.practitioner_uuid) {
          try {
            const res = await apiFetch(getPractitionerPhotoUrl(profile.practitioner_uuid))
            if (!cancelled && res.ok) {
              const blob = await res.blob()
              if (!cancelled) { blobUrl = URL.createObjectURL(blob); setPhotoUrl(blobUrl) }
            }
          } catch { }
        }
      }

      if (!cancelled) {
        console.log("[usePractitioner] setLoadedFor", username)
        setLoadedFor(username)
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
