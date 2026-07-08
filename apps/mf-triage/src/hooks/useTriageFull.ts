import { useState, useEffect, useCallback } from 'react'
import { ENDPOINTS } from '../config/endpoints'
import type { TriageFullApiResponse } from '../types/triageFull.api.types'

export interface UseTriageFullResult {
  data:    TriageFullApiResponse | null
  loading: boolean
  error:   string | null
  refetch: () => void
}

/** GET /triage/:id/full — precarga del formulario en modo lectura/edición. Sin triageId no dispara el fetch. */
export function useTriageFull(triageId: string | number | undefined): UseTriageFullResult {
  const [data,    setData]    = useState<TriageFullApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [tick,    setTick]    = useState(0)

  const refetch = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    if (!triageId) return

    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(ENDPOINTS.triage.full(triageId), {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<TriageFullApiResponse>
      })
      .then(payload => {
        if (!cancelled) setData(payload)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [triageId, tick])

  return { data, loading, error, refetch }
}
