import { CalendarDays, Stethoscope, BarChart } from "@hce/design-system"
import type { ComponentType } from "react"
import { PERMISOS_AMBULATORIO } from "./config/permisos"

export type MenuConfigItem = {
  label:      string
  path:       string
  icon:       ComponentType<{ size?: number }>
  permission: string
}

export const menuConfig: MenuConfigItem[] = [
  { label: "Agenda",    path: "/ambulatorio",            icon: CalendarDays, permission: PERMISOS_AMBULATORIO.agenda    },
  { label: "Consultas", path: "/ambulatorio/consultas",  icon: Stethoscope,  permission: PERMISOS_AMBULATORIO.consultas },
  { label: "Reportes",  path: "/ambulatorio/reports",    icon: BarChart,     permission: PERMISOS_AMBULATORIO.reports   },
]
