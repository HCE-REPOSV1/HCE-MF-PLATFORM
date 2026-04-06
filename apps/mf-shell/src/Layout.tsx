import "./layout.css"

import { createElement, useEffect, useState } from "react"
import { Outlet, useNavigate, useLocation }   from "react-router-dom"

import { useIsMobile }                           from "./hooks/useIsMobile"
import { getFormattedDateTime, getShortDateTime } from "./utils/date"
import { Header, SideNav, SidebarMenu, Footer }   from "@hce/design-system"
import { useUser } from "./context/UserContext"

// Imports estáticos de menuConfig — la federación los inicializa correctamente
import { menuConfig as emergencyMenu }   from "emergency/menuConfig"
import { menuConfig as hospitalMenu }    from "hospital/menuConfig"
import { menuConfig as ambulatorioMenu } from "ambulatorio/menuConfig"
import { menuConfig as auditoriaMenu }   from "auditoria/menuConfig"

import type { MenuItem } from "@hce/design-system"

// ─── Tipos ────────────────────────────────────────────────
type MenuConfigItem = {
  label:      string
  path:       string
  icon:       React.ComponentType<{ size?: number }>
  permission: string
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

function buildMenuItems(configs: MenuConfigItem[], hasPermission: (codigo: string) => boolean): MenuItem[] {
  return configs
    .filter(item => !item.permission || hasPermission(item.permission))
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

  const { user, sede, logout, hasPermission } = useUser()

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

    setMenuItems(buildMenuItems(configs, hasPermission))
  }, [location.pathname, user])

  const handleNavigate = (path: string) => {
    navigate(path)
    setMenuOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    window.location.replace("/")
  }

  return (
    <div className={`app-layout ${collapsed ? "collapsed" : ""}`}>

      {/* HEADER */}
      <header className="app-header">
        <Header
          date={date}
          site={sede || "—"}
          userName={user?.nombreCompleto}
          userRole={user?.nombrePerfil}
          onToggleSidebar={() => setMenuOpen(!mobileMenuOpen)}
          onLogout={handleLogout}
        />
      </header>

      {/* OVERLAY — cierra sidebar al tocar fuera en mobile */}
      {mobileMenuOpen && (
        <div className="app-sidebar-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`app-sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <SideNav collapsed={collapsed} isMobile={isMobile} onToggle={() => setCollapsed(!collapsed)}>
          <SidebarMenu
            items={menuItems}
            collapsed={collapsed}
            onNavigate={handleNavigate}
            currentPath={location.pathname}
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
