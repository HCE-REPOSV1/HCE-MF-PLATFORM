/* eslint-disable */

import { ENDPOINTS } from "../config/endpoints"
import { mapMonitorApiItemToTableRow } from "../../../mf-emergency/src/mapper/monitor.mapper"
import type { MonitorApiResponse } from "../../../mf-emergency/src/types/monitor.api.types"


export async function getMonitorRows() {
  const res = await fetch(ENDPOINTS.monitor.emergencyMonitor, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })

  const data: MonitorApiResponse = await res.json()

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener monitor")
  }

  return data.data.items.map(mapMonitorApiItemToTableRow)
}


