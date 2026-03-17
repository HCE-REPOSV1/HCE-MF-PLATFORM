import "./layout.css"

import { createElement, useEffect, useState } from "react"
import { Outlet, useNavigate, useLocation }   from "react-router-dom"

import { useIsMobile }                           from "./hooks/useIsMobile"
import { getFormattedDateTime, getShortDateTime } from "./utils/date"
import { Header, SideNav, SidebarMenu, Footer }   from "@jarvis/design-system"

// Imports estáticos de menuConfig — la federación los inicializa correctamente
import { menuConfig as emergencyMenu }   from "emergency/menuConfig"
import { menuConfig as hospitalMenu }    from "hospital/menuConfig"
import { menuConfig as ambulatorioMenu } from "ambulatorio/menuConfig"
import { menuConfig as auditoriaMenu }   from "auditoria/menuConfig"

import type { MenuItem } from "@design-system/organisms/SidebarMenu/types"

// ─── Tipos ────────────────────────────────────────────────
type MenuConfigItem = {
  label:      string
  path:       string
  icon:       React.ComponentType<{ size?: number }>
  permission: string
}

type JarvisUser = {
  name?:        string
  role?:        string
  permissions?: string[]
}

// ─── Mapa estático de menuConfigs por módulo ──────────────
const MODULE_MENUS: Record<string, MenuConfigItem[]> = {
  emergency:   emergencyMenu,
  hospital:    hospitalMenu,
  ambulatorio: ambulatorioMenu,
  auditoria:   auditoriaMenu,
}

function getActiveModule(pathname: string): string | null {
  if (pathname.startsWith("/emergency"))   return "emergency"
  if (pathname.startsWith("/hospital"))    return "hospital"
  if (pathname.startsWith("/ambulatorio")) return "ambulatorio"
  if (pathname.startsWith("/auditoria"))   return "auditoria"
  return null
}

function buildMenuItems(configs: MenuConfigItem[], permissions: string[]): MenuItem[] {
  return configs
    .filter(item => permissions.length === 0 || permissions.includes(item.permission))
    .map((item): MenuItem => ({
      label: item.label,
      path:  item.path,
      icon:  createElement(item.icon, { size: 18 }),
    }))
}

// ─────────────────────────────────────────────────────────
export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()

  const [date, setDate]               = useState(isMobile ? getShortDateTime() : getFormattedDateTime())
  const [collapsed, setCollapsed]     = useState(false)
  const [mobileMenuOpen, setMenuOpen] = useState(false)
  const [menuItems, setMenuItems]     = useState<MenuItem[]>([])

  const user = JSON.parse(sessionStorage.getItem("jarvis_user") ?? "{}") as JarvisUser

  // Actualizar reloj
  useEffect(() => {
    const update = () => setDate(isMobile ? getShortDateTime() : getFormattedDateTime())
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [isMobile])

  // Actualizar sidebar al cambiar de módulo
  useEffect(() => {
    const module = getActiveModule(location.pathname)
    if (!module) return

    const configs = MODULE_MENUS[module]
    if (!configs) return

    const freshUser    = JSON.parse(sessionStorage.getItem("jarvis_user") ?? "{}") as JarvisUser
    const permissions  = freshUser.permissions ?? []
    setMenuItems(buildMenuItems(configs, permissions))
  }, [location.pathname])

  const handleNavigate = (path: string) => {
    navigate(path)
    setMenuOpen(false)
  }

  return (
    <div className={`app-layout ${collapsed ? "collapsed" : ""}`}>

      {/* HEADER */}
      <header className="app-header">
        <Header
          date={date}
          site="SEDE CENTRAL"
          userName={user.name}
          userRole={user.role}
          onToggleSidebar={() => setMenuOpen(!mobileMenuOpen)}
        />
      </header>

      {/* SIDEBAR */}
      <aside className={`app-sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <SideNav collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)}>
          <SidebarMenu
            items={menuItems}
            collapsed={collapsed}
            onNavigate={handleNavigate}
          />
        </SideNav>
      </aside>

      {/* CONTENT */}
      <main className="app-content">
        <Outlet />
      </main>

      {/* FOOTER */}
      <div className="app-footer">
        <Footer />
      </div>

    </div>
  )
}
