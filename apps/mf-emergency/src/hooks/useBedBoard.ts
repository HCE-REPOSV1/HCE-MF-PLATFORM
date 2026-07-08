import { useState, useEffect, useCallback } from 'react'
import { ENDPOINTS } from '../config/endpoints'
import type { BedApiItem } from '../mapper/bed.mapper'

interface BedBoardApiResponse {
  success: boolean
  data: BedApiItem[]
}

interface UseBedBoardOptions {
  locationId: number | string | undefined
  /** Solo dispara el fetch cuando es true — evita llamadas mientras el drawer está cerrado. */
  enabled: boolean
}

export interface UseBedBoardResult {
  beds:    BedApiItem[]
  loading: boolean
  error:   string | null
  refetch: () => void
}

/** Tablero de camas de una sede (GET /encounter/beds/board), con color por estado ya resuelto por el backend. */
export function useBedBoard({ locationId, enabled }: UseBedBoardOptions): UseBedBoardResult {
  const [beds,    setBeds]    = useState<BedApiItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [tick,    setTick]    = useState(0)

  const refetch = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    if (!enabled || !locationId) return

    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(ENDPOINTS.bedManagement.board(locationId), {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<BedBoardApiResponse>
      })
      .then(payload => {
        if (!cancelled) setBeds(Array.isArray(payload.data) ? payload.data : [])
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [locationId, enabled, tick])

  return { beds, loading, error, refetch }
}
