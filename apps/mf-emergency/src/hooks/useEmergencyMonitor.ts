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

  // Route param (monitor TV público) tiene prioridad; si no hay, cae al location_uuid
  // de la sede activa del usuario logueado (monitor del dashboard).
  const finalLocationUuid = locationUuid ?? sedeUuid ?? undefined

  useEffect(() => {
    if (!finalLocationUuid) return
    if (!DECRYPT_KEY) {
      setError('[useEmergencyMonitor] VITE_EMERGENCY_DECRYPT_KEY no está configurado')
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

   

    const url = ENDPOINTS.emergencyMonitor.public(finalLocationUuid, page, finalLimit)

    fetch(url, {
      method: "GET",
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<EncryptedPayload>
      })
      .then(payload => decryptAesGcm(payload, DECRYPT_KEY))
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
  }, [finalLocationUuid, page, limit, tick])

  return { data, loading, error, refetch }
}
