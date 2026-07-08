import { useUser } from "shell/UserContext"

/**
 * location_uuid de la sede activa del usuario logueado — para el monitor del dashboard,
 * que ahora requiere location_uuid en vez de location_id (ver useSede.ts, que sigue
 * exponiendo el location_id sin cambios para los módulos que aún lo requieren, ej. triage).
 */
export function useSedeUuid() {
  return useUser().sedeActualUuid
}
