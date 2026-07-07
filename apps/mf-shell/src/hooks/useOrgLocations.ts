import { useState, useEffect } from "react"
import { apiFetch } from "../services/api.service"
import { ENDPOINTS } from "../config/endpoints"

export interface OrgLocation {
  location_id:    number
  location_uuid:  string
  location_alias: string
  location_name:  string
  is_active:      boolean
}

interface OrgLocationsResponse {
  success: boolean
  data:    OrgLocation[]
}

export function useOrgLocations(enabled: boolean = true): OrgLocation[] {
  const [locations, setLocations] = useState<OrgLocation[]>([])

  useEffect(() => {
    if (!enabled) {
      setLocations([])
      return
    }
    let cancelled = false
    apiFetch(ENDPOINTS.organization.locations)
      .then(res => (res.ok ? res.json() as Promise<OrgLocationsResponse> : null))
      .then(json => {
        if (!cancelled && json?.success) {
          setLocations(json.data.filter(l => l.is_active))
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [enabled])

  return locations
}
