import { SidebarMenu, MenuItem } from "@design-system/navigation/SidebarMenu"
import { Monitor, Users, BarChart, Settings } from "lucide-react"

type Props = {
  onNavigate: (path: string) => void
  collapsed?: boolean
}

const menuItems: MenuItem[] = [
  {
    label: "Monitor Emergencia",
    path: "/home",
    icon: <Monitor size={18}/>
  },
  {
    label: "Pacientes",
    path: "/patients",
    icon: <Users size={18}/>
  },
  {
    label: "Reportes",
    path: "/reports",
    icon: <BarChart size={18}/>
  },
  {
    label: "Configuración",
    path: "/settings",
    icon: <Settings size={18}/>
  }
]
export default function Navigation({ onNavigate, collapsed }: Props) {
  return (
    <SidebarMenu
      items={menuItems}
      collapsed={collapsed}
      onNavigate={onNavigate}
    />
  )
}