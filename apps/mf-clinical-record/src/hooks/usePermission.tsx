import { useUser } from "shell/UserContext"

/**
 * Retorna true si el código semántico dado está habilitado.
 * Códigos que MAC aún no define → true por defecto (comportamiento provisional).
 * Códigos que MAC retorna con indicador "O" → false.
 */
export function usePermission(codigo: string): boolean {
  const { hasPermission } = useUser()
  return hasPermission(codigo)
}
