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
          fetchError = null
          break
        } catch (err) {
          fetchError = err
        }
      }

      if (cancelled) return

      if (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Error al cargar perfil del practitioner")
        setData(null)
      } else {
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

      if (!cancelled) setLoadedFor(username)
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
