// DEBUG temporal — buffer compartido visible en pantalla (no en consola), porque abrir
// DevTools cambia el timing lo suficiente como para que el bug de timing no se reproduzca.
// Borrar junto con el overlay en Header.tsx una vez resuelto el bug del subtítulo.
const START = performance.now()
const buffer: string[] = []
const listeners = new Set<() => void>()

export function pushDebugLog(msg: string) {
  const t = (performance.now() - START).toFixed(0)
  buffer.push(`+${t}ms ${msg}`)
  if (buffer.length > 40) buffer.shift()
  listeners.forEach(l => l())
}

export function getDebugLog(): string[] {
  return buffer
}

export function subscribeDebugLog(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
