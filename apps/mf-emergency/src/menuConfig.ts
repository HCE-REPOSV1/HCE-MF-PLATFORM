import { Monitor, Users, BarChart, Settings } from "lucide-react"
import type { ComponentType } from "react"

export type MenuConfigItem = {
  label:      string
  path:       string
  icon:       ComponentType<{ size?: number }>
  permission: string
}

export const menuConfig: MenuConfigItem[] = [
  { label: "Monitor Emergencia", path: "/emergency",           icon: Monitor,  permission: "emergency:monitor"  },
  { label: "Pacientes",          path: "/emergency/patients",  icon: Users,    permission: "emergency:patients" },
  { label: "Reportes",           path: "/emergency/reports",   icon: BarChart, permission: "emergency:reports"  },
  { label: "Configuración",      path: "/emergency/settings",  icon: Settings, permission: "emergency:settings" },
]
