import { useUser } from "shell/UserContext"

export function usePermiso(codigo: string): boolean {
  const { hasPermission } = useUser()
  return hasPermission(codigo)
}
