import { LayoutDashboard, BedDouble, Scissors, BarChart } from "@jarvis/design-system"
import type { ComponentType } from "react"

export type MenuConfigItem = {
  label:      string
  path:       string
  icon:       ComponentType<{ size?: number }>
  permission: string
}

export const menuConfig: MenuConfigItem[] = [
  { label: "Panel Hospital", path: "/hospital",              icon: LayoutDashboard, permission: "hospital:panel"      },
  { label: "Internados",     path: "/hospital/internados",   icon: BedDouble,       permission: "hospital:internados" },
  { label: "Quirófanos",     path: "/hospital/quirofanos",   icon: Scissors,        permission: "hospital:quirofanos" },
  { label: "Reportes",       path: "/hospital/reports",      icon: BarChart,        permission: "hospital:reports"    },
]
