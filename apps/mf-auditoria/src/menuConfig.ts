import { LayoutDashboard, ClipboardList, BarChart } from "@hce/design-system"
import type { ComponentType } from "react"
import { PERMISOS_AUDITORIA } from "./config/permisos"

export type MenuConfigItem = {
  label:      string
  path:       string
  icon:       ComponentType<{ size?: number }>
  permission: string
}

export const menuConfig: MenuConfigItem[] = [
  { label: "Dashboard",  path: "/auditoria",            icon: LayoutDashboard, permission: PERMISOS_AUDITORIA.dashboard  },
  { label: "Auditorías", path: "/auditoria/auditorias", icon: ClipboardList,   permission: PERMISOS_AUDITORIA.auditorias },
  { label: "Reportes",   path: "/auditoria/reports",    icon: BarChart,        permission: PERMISOS_AUDITORIA.reports    },
]
