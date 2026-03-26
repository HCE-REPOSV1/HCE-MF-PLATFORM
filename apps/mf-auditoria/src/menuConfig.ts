import { LayoutDashboard, ClipboardList, BarChart } from "@hce/design-system"
import type { ComponentType } from "react"

export type MenuConfigItem = {
  label:      string
  path:       string
  icon:       ComponentType<{ size?: number }>
  permission: string
}

export const menuConfig: MenuConfigItem[] = [
  { label: "Dashboard",  path: "/auditoria",             icon: LayoutDashboard, permission: "auditoria:dashboard" },
  { label: "Auditorías", path: "/auditoria/auditorias",  icon: ClipboardList,   permission: "auditoria:auditorias"},
  { label: "Reportes",   path: "/auditoria/reports",     icon: BarChart,        permission: "auditoria:reports"   },
]
