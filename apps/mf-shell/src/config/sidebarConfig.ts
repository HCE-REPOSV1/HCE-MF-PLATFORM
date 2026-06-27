import type { OpcionMAC } from "@hce/design-system"

/**
 * Árbol estático del sidebar — replica la jerarquía que entrega MAC.
 *
 * Cada ítem lleva un `permission` con el código semántico interno.
 * `hasPermission()` determina cuáles se muestran, usando el macMapping
 * para traducir lo que retorna MAC.
 *
 * Cuando el equipo de backend entregue el árbol definitivo:
 *   1. Actualizar macMapping.ts con los nuevos códigos MAC
 *   2. Este archivo NO cambia
 */
type SidebarItem = {
  idMenu:     number
  titulo:     string
  vista:      string
  icono:      string
  permission: string
  children?:  SidebarItem[]
}

const SIDEBAR_TREE: SidebarItem[] = [
  {
    idMenu:     7777,
    titulo:     "Historias Clínicas",
    vista:      "",               // nodo categoría — no navega
    icono:      "HceMenuIcon",
    permission: "hce:root",       // [MAC] 01
    children: [
      { idMenu: 7778, titulo: "HCE Emergencia",  vista: "/emergencia",  icono: "", permission: "emergency:module"   },
      { idMenu: 7779, titulo: "HCE Ambulatorio", vista: "/ambulatorio", icono: "", permission: "ambulatorio:module" },
      { idMenu: 7780, titulo: "HCE Hospital",    vista: "/hospital",    icono: "", permission: "hospital:module"    },
      { idMenu: 7781, titulo: "Auditoría Médica",vista: "/auditoria",   icono: "", permission: "auditoria:module"   },
    ],
  },
]

function toOpcionMAC(item: SidebarItem, parentId: number, hasPermission: (c: string) => boolean): OpcionMAC | null {
  const visibleChildren = (item.children ?? [])
    .map(c => toOpcionMAC(c, item.idMenu, hasPermission))
    .filter((c): c is OpcionMAC => c !== null)

  // Nodo hoja sin permiso → ocultar
  if (!item.children && !hasPermission(item.permission)) return null

  // Nodo padre: mostrar solo si tiene permiso propio Y al menos un hijo visible
  if (item.children && (!hasPermission(item.permission) || visibleChildren.length === 0)) return null

  return {
    idMenu:        item.idMenu,
    titulo:        item.titulo,
    idMenuPadre:   parentId,
    vista:         item.vista,
    icono:         item.icono,
    codigo:      item.permission,
    indicador:   "E",
    opciones:    visibleChildren,
  }
}

/**
 * Construye el array OpcionMAC para el sidebar respetando la jerarquía
 * y filtrando por hasPermission (vía macMapping).
 *
 * Con la respuesta MAC del ejemplo:
 *   hce:root         → E → visible (padre)
 *   emergency:module → E → visible
 *   ambulatorio:module → E → visible
 *   hospital:module  → O → oculto
 *   auditoria:module → O → oculto
 *
 * Resultado: "Historias Clínicas" con dos hijos visibles.
 */
export function buildSidebarOpciones(
  hasPermission: (codigo: string) => boolean
): OpcionMAC[] {
  return SIDEBAR_TREE
    .map(item => toOpcionMAC(item, 0, hasPermission))
    .filter((item): item is OpcionMAC => item !== null)
}
