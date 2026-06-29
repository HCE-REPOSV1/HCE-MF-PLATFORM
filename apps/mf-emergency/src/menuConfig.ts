import { Monitor, Users, BarChart, Settings } from "@hce/design-system"
import type { ComponentType } from "react"
import { PERMISOS_EMERGENCY } from "./config/permisos"

export type MenuConfigItem = {
  label:      string
  path:       string
  icon:       ComponentType<{ size?: number }>
  permission: string
}

export const menuConfig: MenuConfigItem[] = [
  { label: "Monitor Emergencia", path: "/emergencia",          icon: Monitor,  permission: PERMISOS_EMERGENCY.monitor   },
  { label: "Pacientes",          path: "/emergencia/patients", icon: Users,    permission: PERMISOS_EMERGENCY.patients  },
  { label: "Reportes",           path: "/emergencia/reports",  icon: BarChart, permission: PERMISOS_EMERGENCY.reports   },
  { label: "Configuración",      path: "/emergencia/settings", icon: Settings, permission: PERMISOS_EMERGENCY.settings  },
]
