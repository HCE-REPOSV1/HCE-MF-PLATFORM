/**
 * ---------------------------------------------------------
 * Hook: useDateTime
 * Description:
 * Retorna la fecha y hora actual formateada para el header
 * del Monitor de Emergencia. Se actualiza cada minuto.
 *
 * Formato: "Lun 09 Mar 2026 — 14:32"
 * ---------------------------------------------------------
 */
import { useState, useEffect } from "react"

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

function formatDateTime(date: Date): string {
  const day   = DAYS[date.getDay()]
  const num   = date.getDate().toString().padStart(2, "0")
  const month = MONTHS[date.getMonth()]
  const year  = date.getFullYear()
  const hh    = date.getHours().toString().padStart(2, "0")
  const mm    = date.getMinutes().toString().padStart(2, "0")
  return `${day} ${num} ${month} ${year} — ${hh}:${mm}`
}

export function useDateTime(): string {
  const [dateTime, setDateTime] = useState(() => formatDateTime(new Date()))

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(formatDateTime(new Date()))
    }, 60_000)
    return () => clearInterval(timer)
  }, [])

  return dateTime
}
