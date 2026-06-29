import { LayoutDashboard, BedDouble, Scissors, BarChart } from "@hce/design-system"
import type { ComponentType } from "react"
import { PERMISOS_HOSPITAL } from "./config/permisos"

export type MenuConfigItem = {
  label:      string
  path:       string
  icon:       ComponentType<{ size?: number }>
  permission: string
}

export const menuConfig: MenuConfigItem[] = [
  { label: "Panel Hospital", path: "/hospital",             icon: LayoutDashboard, permission: PERMISOS_HOSPITAL.panel      },
  { label: "Internados",     path: "/hospital/internados",  icon: BedDouble,       permission: PERMISOS_HOSPITAL.internados },
  { label: "Quirófanos",     path: "/hospital/quirofanos",  icon: Scissors,        permission: PERMISOS_HOSPITAL.quirofanos },
  { label: "Reportes",       path: "/hospital/reports",     icon: BarChart,        permission: PERMISOS_HOSPITAL.reports    },
]
