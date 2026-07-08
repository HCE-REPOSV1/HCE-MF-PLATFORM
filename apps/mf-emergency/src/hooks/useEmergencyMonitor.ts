import { useState, useEffect, useCallback } from 'react'
import { useSedeUuid } from './useSedeUuid'
import { decryptAesGcm } from '../services/crypto.service'
import type { EncryptedPayload } from '../services/crypto.service'
import { ENDPOINTS } from '../config/endpoints'


const DECRYPT_KEY = import.meta.env.VITE_EMERGENCY_DECRYPT_KEY as string

interface UseEmergencyMonitorOptions {
  page?:  number
  limit?: number
  /** UUID público de la sede (location_uuid). Viene del route param en la vista de TV pública. */
  locationUuid?: string
}

export interface UseEmergencyMonitorResult {
  data:    unknown
  loading: boolean
  error:   string | null
  refetch: () => void
}

export function useEmergencyMonitor({
  page  = 1,
  limit ,
  locationUuid,
}: UseEmergencyMonitorOptions = {}): UseEmergencyMonitorResult {
  const sedeUuid = useSedeUuid()

  const [data,    setData]    = useState<unknown>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [tick,    setTick]    = useState(0)

  const refetch = useCallback(() => setTick(t => t + 1), [])

  const finalLimit = limit ?? 20

  // locationUuid explícito (route param) => monitor TV público, sin sesión, endpoint cifrado.
  // Sin locationUuid => monitor del dashboard logueado, cae al location_uuid de la sede
  // activa del usuario (useSedeUuid), endpoint autenticado sin cifrar. Nunca deben mezclarse:
  // el público es la única ruta libre en la primera capa del apigw, el del dashboard exige
  // sesión (JwtAuthGuard) en ambos gateways.
  const isPublicView = locationUuid !== undefined
  const finalLocationUuid = locationUuid ?? sedeUuid ?? undefined

  useEffect(() => {
    if (!finalLocationUuid) return
    if (isPublicView && !DECRYPT_KEY) {
      setError('[useEmergencyMonitor] VITE_EMERGENCY_DECRYPT_KEY no está configurado')
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const url = isPublicView
      ? ENDPOINTS.emergencyMonitor.public(finalLocationUuid, page, finalLimit)
      : ENDPOINTS.emergencyMonitor.porSede(finalLocationUuid, page, finalLimit)

    // cache: "no-store" — sin esto, refetch() podía pegarle a la misma URL y recibir una
    // respuesta HTTP cacheada vieja en vez de la data fresca (ej. tras guardar un triaje,
    // la grilla seguía mostrando el conteo anterior hasta un reload completo).
    fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(payload => (isPublicView ? decryptAesGcm(payload as EncryptedPayload, DECRYPT_KEY) : payload))
      .then(decrypted => {
        if (!cancelled) setData(decrypted)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [finalLocationUuid, isPublicView, page, limit, tick])

  return { data, loading, error, refetch }
}
