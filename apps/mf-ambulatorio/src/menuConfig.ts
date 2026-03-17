import { CalendarDays, Stethoscope, BarChart } from "lucide-react"
import type { ComponentType } from "react"

export type MenuConfigItem = {
  label:      string
  path:       string
  icon:       ComponentType<{ size?: number }>
  permission: string
}

export const menuConfig: MenuConfigItem[] = [
  { label: "Agenda",    path: "/ambulatorio",           icon: CalendarDays, permission: "ambulatorio:agenda"    },
  { label: "Consultas", path: "/ambulatorio/consultas", icon: Stethoscope,  permission: "ambulatorio:consultas" },
  { label: "Reportes",  path: "/ambulatorio/reports",   icon: BarChart,     permission: "ambulatorio:reports"   },
]
