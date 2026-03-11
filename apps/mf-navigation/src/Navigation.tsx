import {
  SidebarMenu,
  type MenuItem
} from "@design-system/navigation/SidebarMenu"

/**
 * Props que recibe el microfrontend
 */
type Props = {
  onNavigate: (path: string) => void
}

const menuItems: MenuItem[] = [

  {
    label: "Monitor Emergencia",
    path: "/home"
  },

  {
    label: "Pacientes",
    path: "/patients"
  },

  {
    label: "Reportes",
    path: "/reports"
  },

  {
    label: "Configuración",
    path: "/settings"
  }

]

export default function Navigation({ onNavigate }: Props) {

  return (

    <SidebarMenu
      items={menuItems}
      onNavigate={onNavigate}
    />

  )
}