import { useState, useEffect, useRef } from "react"

declare const __BUILD_TIME__: string

/** Intervalo de comprobación: 5 minutos */
const POLL_INTERVAL_MS = 1 * 60 * 1000

/**
 * Detecta si hay una versión nueva desplegada comparando el buildTime
 * del bundle actual (inyectado en build-time) con el del servidor
 * (polled desde /version.json).
 *
 * En desarrollo no hace nada: __BUILD_TIME__ estará vacío.
 */
export function useVersionChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  // Captura la versión del bundle que el usuario tiene cargada ahora mismo
  const currentBuild = useRef(
    typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : ""
  )

  useEffect(() => {
    // Sin versión embebida (dev) → no pollear
    if (!currentBuild.current) return

    const check = async () => {
      try {
        const res = await fetch(`/version.json?_=${Date.now()}`, {
          cache: "no-store",
        })
        if (!res.ok) return
        const { buildTime } = (await res.json()) as { buildTime: string }
        if (buildTime && buildTime !== currentBuild.current) {
          setUpdateAvailable(true)
        }
      } catch {
        // Sin red o archivo no encontrado — se reintentará al siguiente intervalo
      }
    }

    const id = setInterval(check, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return { updateAvailable }
}
