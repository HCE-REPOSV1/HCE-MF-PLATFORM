import type { OpcionMAC } from "@hce/design-system"

/**
 * Configuración estática del sidebar — fuente de verdad del front.
 *
 * Cada ítem tiene un `permission` con el código semántico interno.
 * `hasPermission()` determina cuáles se muestran, usando el macMapping
 * para traducir lo que retorna MAC.
 *
 * Cuando el equipo de backend entregue el árbol definitivo:
 *   1. Actualizar macMapping.ts con los nuevos códigos MAC
 *   2. Este archivo NO cambia
 */
type SidebarModuleItem = {
  idMenu:     number
  titulo:     string
  vista:      string
  icono:      string
  permission: string
}

const SIDEBAR_MODULES: SidebarModuleItem[] = [
  { idMenu: 1, titulo: "HCE Emergencia",  vista: "/emergencia",  icono: "", permission: "emergency:module"   },
  { idMenu: 2, titulo: "HCE Ambulatorio", vista: "/ambulatorio", icono: "", permission: "ambulatorio:module" },
  { idMenu: 3, titulo: "HCE Hospital",    vista: "/hospital",    icono: "", permission: "hospital:module"    },
  { idMenu: 4, titulo: "Auditoría Médica",vista: "/auditoria",   icono: "", permission: "auditoria:module"   },
]

/**
 * Construye el array OpcionMAC para el sidebar filtrando por hasPermission.
 * - emergency:module → false (MAC dice "O") → oculto
 * - ambulatorio:module → true (MAC dice "E") → visible
 * - Cualquier código provisional (no en macMapping) → true por defecto
 */
export function buildSidebarOpciones(
  hasPermission: (codigo: string) => boolean
): OpcionMAC[] {
  return SIDEBAR_MODULES
    .filter(m => hasPermission(m.permission))
    .map(m => ({
      idMenu:        m.idMenu,
      titulo:        m.titulo,
      nombre:        m.titulo,
      idMenuPadre:   0,
      vista:         m.vista,
      icono:         m.icono,
      codigo:        m.permission,
      indicador:     "E",
      codigoSistema: 25,
      opciones:      [],
    }))
}
