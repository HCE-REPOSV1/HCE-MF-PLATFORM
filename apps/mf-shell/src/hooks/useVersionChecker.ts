import { useState, useEffect, useRef } from "react"

declare const __BUILD_TIME__: string

/** Intervalo de comprobación: 1 minuto */
const POLL_INTERVAL_MS = 1 * 60 * 1000

/**
 * Extrae el origen (protocol+host+port) del remote a partir de su remoteEntry URL.
 * Funciona independientemente de si remoteEntry.js está en la raíz o en /assets/:
 *   "http://host:port/remoteEntry.js"        → "http://host:port"
 *   "http://host:port/assets/remoteEntry.js" → "http://host:port"
 */
function remoteBase(envVal: string | undefined): string | null {
  if (!envVal) return null
  try {
    return new URL(envVal).origin
  } catch {
    return null
  }
}

/**
 * Devuelve las URLs de version.json de todos los remotes
 * configurados en el shell (derivadas de las variables VITE_REMOTE_*).
 */
function getRemoteVersionUrls(): string[] {
  const remoteEntryUrls = [
    import.meta.env.VITE_REMOTE_AUTH,
    import.meta.env.VITE_REMOTE_HOME,
    import.meta.env.VITE_REMOTE_EMERGENCY,
    import.meta.env.VITE_REMOTE_HOSPITAL,
    import.meta.env.VITE_REMOTE_AMBULATORIO,
    import.meta.env.VITE_REMOTE_AUDITORIA,
    import.meta.env.VITE_REMOTE_HEADER,
    import.meta.env.VITE_REMOTE_SIDEBAR,
    import.meta.env.VITE_REMOTE_FOOTER,
    import.meta.env.VITE_REMOTE_TRIAGE
  ] as (string | undefined)[]

  return remoteEntryUrls
    .map(remoteBase)
    .filter((b): b is string => b !== null)
    .map(base => `${base}/version.json`)
}

/** Obtiene el buildTime de un version.json remoto. Devuelve null si falla. */
async function fetchBuildTime(url: string): Promise<string | null> {
  try {
    const res = await fetch(`${url}?_=${Date.now()}`, { cache: "no-store" })
    if (!res.ok) return null
    const { buildTime } = (await res.json()) as { buildTime?: string }
    return buildTime ?? null
  } catch {
    return null
  }
}

/**
 * Detecta nuevas versiones desplegadas tanto en el shell como en cualquier remote.
 *
 * Estrategia:
 *  - Shell: compara __BUILD_TIME__ (embebido en el bundle) con /version.json del servidor.
 *  - Remotes: al montar captura un baseline de sus version.json; en cada poll
 *    compara contra el baseline. Si cualquiera cambió → hay nueva versión.
 *
 * En desarrollo (__BUILD_TIME__ vacío) no hace nada.
 */
export function useVersionChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  const shellBuild    = useRef(typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : "")
  const remoteBaseline = useRef<Record<string, string>>({})
  const baselineReady  = useRef(false)

  useEffect(() => {
    if (!shellBuild.current) return  // dev → no pollear

    const remoteUrls = getRemoteVersionUrls()

    /** Captura los buildTimes actuales de los remotes como punto de referencia (al cargar la página) */
    const captureBaseline = async () => {
      const entries = await Promise.all(
        remoteUrls.map(async url => {
          const bt = await fetchBuildTime(url)
          return [url, bt ?? ""] as const
        })
      )
      remoteBaseline.current = Object.fromEntries(entries)
      baselineReady.current  = true
    }

    /** Comprueba shell + remotes; activa el modal si cualquiera cambió */
    const check = async () => {
      // 1. Verificar shell
      const shellBt = await fetchBuildTime("/version.json")
      if (shellBt && shellBt !== shellBuild.current) {
        setUpdateAvailable(true)
        return
      }

      // 2. Verificar remotes (solo cuando el baseline ya está listo)
      if (!baselineReady.current) return
      const changed = await Promise.all(
        remoteUrls.map(async url => {
          const bt = await fetchBuildTime(url)
          return bt !== null && bt !== "" && bt !== remoteBaseline.current[url]
        })
      )
      if (changed.some(Boolean)) setUpdateAvailable(true)
    }

    captureBaseline()
    const id = setInterval(check, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return { updateAvailable }
}
