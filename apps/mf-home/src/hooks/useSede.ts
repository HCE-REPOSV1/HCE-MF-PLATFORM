import { useUser } from "shell/UserContext"

export function useSede() {
  return useUser().sedeActual
}
